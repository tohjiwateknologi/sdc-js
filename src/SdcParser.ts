/*
 * Copyright 2025-2026 PT Tohjiwa Teknologi Indonesia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {SdcByteView} from "./SdcByteView";
import {SdcBlockByte} from "./SdcBlockByte";
import {SdcDocumentByte} from "./SdcDocumentByte";
import {SdcBlockContent} from "./SdcBlockContent";
import {SdcBlockContentMapped} from "./SdcBlockContentMapped";
import {ContentGeneric} from "./ContentGeneric";
import {ContentTextPlain} from "./ContentTextPlain";
import {ContentApplicationSdc} from "./ContentApplicationSdc";
import {ContentTextMarkdown} from "./ContentTextMarkdown";
import {SdcDocumentMapper} from "./SdcDocumentMapper";

export type SdcBlockContentConstructor = new () => SdcBlockContent<any>;

export class SdcParser {
    private readonly majorVersion = 49;
    private registryBlockType: Map<string, SdcBlockContentConstructor> = new Map();
    private readonly SDC_PREFIX = new TextEncoder().encode("SDC/");
    private readonly BLOCK_PREFIX = new TextEncoder().encode("block ");
    private readonly END_ARROW_RIGHT = new TextEncoder().encode("end->");
    private readonly END = new TextEncoder().encode("end");

    constructor() {
        this.registryBlockType.set(ContentGeneric.CONTENT_TYPE, ContentGeneric);
        this.registryBlockType.set(ContentTextPlain.CONTENT_TYPE, ContentTextPlain);
        this.registryBlockType.set(ContentTextMarkdown.CONTENT_TYPE, ContentTextMarkdown);
        this.registryBlockType.set(ContentApplicationSdc.CONTENT_TYPE, ContentApplicationSdc);
    }

    addBlockType(supplier: SdcBlockContentConstructor): void {
        const instance = new supplier();
        const contentType = instance.getContentType();
        this.registryBlockType.set(contentType, supplier);
    }

    public readFromBytes(data: Uint8Array): SdcDocumentByte {
        return this.parseFromBytesUnchecked(data, data.length);
    }

    public readFromString(input: string): SdcDocumentByte {
        const bytes = new TextEncoder().encode(input);
        return this.parseFromBytesUnchecked(bytes, bytes.length);
    }

    public writeToString(doc: SdcDocumentByte): string {
        let result: string[] = [];

        // SDC Header
        const version = doc.getVersionString?.() ?? "";
        result.push(`SDC/${version}\n`);

        // SDC Document Metadata
        if (doc.metadata) {
            for (const [key, valueView] of doc.metadata.entries()) {
                const value = this.byteViewToString(valueView);
                if (key != null && value != null) {
                    result.push(`${key}: ${value}\n`);
                }
            }
        }

        // All Blocks
        if (doc.blocks) {
            for (const [, block] of doc.blocks.entries()) {

                // Block Definition
                result.push(`\nblock `);

                const id = block.getIdString?.();
                const parent = block.getParentIdString?.();
                const order = block.getOrderString?.();

                if (id) result.push(id);
                if (parent && parent.length > 0) result.push(`<-${parent}`);
                if (order && order.length > 0) result.push(` ${order}`);
                result.push(`\n`);

                // Block Metadata
                let contentLength = 0;
                const abc = block.content;
                if (abc != null) {
                    if (this.isMappedContent(abc)) {
                        contentLength = new TextEncoder().encode(abc.writeToStringWithMapper(new SdcDocumentMapper(this))).length;
                    } else {
                        contentLength = new TextEncoder().encode(abc.writeToString()).length;
                    }
                }

                let contentType: string | null = null;

                if (block.content != null) {
                    contentType = block.content.getContentType();
                    result.push(`content-type: ${contentType}\n`);
                }

                if (contentType !== null || block.content != null) {
                    result.push(`content-length: ${contentLength}\n`);
                }

                // write what present in metadata
                if (block.metadata) {
                    for (const [metaKey, metaValue] of block.metadata.entries()) {

                        if (metaKey == null) continue;
                        if (metaKey === "content-type") continue; // skip and we'll use write computed type instead
                        if (metaKey === "content-length") continue; // skip and we'll use write computed length instead

                        const val = this.byteViewToString(metaValue);
                        result.push(`${metaKey}: ${val ?? ""}\n`);
                    }
                }

                // add end-line after block metadata
                if (contentType !== null) {
                    result.push(`\n`);
                }

                // content
                const abc1 = block.content;
                if (abc1) {
                    if (this.isMappedContent(abc1)) {
                        result.push(abc1.writeToStringWithMapper(new SdcDocumentMapper(this)));
                    } else {
                        result.push(abc1.writeToString());
                    }

                    result.push(`\n`);
                }

                // block content end->
                if (contentType !== null) {
                    if (contentLength > 0) {
                        result.push(`\n`);
                    }

                    result.push(`end->${id}\n`);
                }
            }
        }

        return result.join("");
    }

    private byteViewToString(v: SdcByteView | null): string | null {
        return v == null ? null : v.toString();
    }

    private parseFromBytesUnchecked(data: Uint8Array, length: number): SdcDocumentByte {
        const pos: [number, number] = [0, length];
        const doc = new SdcDocumentByte();

        this.parseSdcDocHead(data, pos, doc);
        this.parseSdcDocMetadata(data, pos, doc);
        this.parseSdcBlockAll(data, pos, doc);

        return doc;
    }

    private parseSdcDocHead(data: Uint8Array, pos: [number, number], doc: SdcDocumentByte): void {
        const lineEnd = this.findLineEnd(data, pos[0], pos[1]);
        const line = new SdcByteView(data, pos[0], lineEnd - pos[0]);

        if (!line.startsWith(this.SDC_PREFIX)) {
            throw new Error("Invalid SDC header");
        }

        const version = line.substring(this.SDC_PREFIX.length).trim();
        const major = version.byteAt(0);

        if (this.majorVersion < major) {
            throw new Error("cannot read newer SDC version");
        }

        doc.version = version;

        pos[0] = this.skipToNextLine(data, lineEnd, pos[1]);
    }

    private parseSdcDocMetadata(data: Uint8Array, pos: [number, number], doc: SdcDocumentByte): void {
        // Parse document metadata: lines until the first empty line or BLOCK_PREFIX
        let lineEnd: number;

        while (pos[0] < pos[1]) {
            lineEnd = this.findLineEnd(data, pos[0], pos[1]);
            if (lineEnd === pos[0]) { // Empty line terminates doc metadata
                pos[0] = this.skipToNextLine(data, lineEnd, pos[1]);
                break;
            }

            const line = new SdcByteView(data, pos[0], lineEnd - pos[0]);
            if (line.startsWith(this.BLOCK_PREFIX)) {
                break;
            }

            // Split key:value
            const colonIndex = this.findColon(data, pos[0], lineEnd);
            if (colonIndex !== -1) {
                const keyView = new SdcByteView(data, pos[0], colonIndex - pos[0]).trim();
                const valueView = new SdcByteView(data, colonIndex + 1, lineEnd - (colonIndex + 1)).trim();
                doc.metadata.set(keyView.toString(), valueView);
            }

            pos[0] = this.skipToNextLine(data, lineEnd, pos[1]);
        }
    }

    private parseSdcBlockAll(data: Uint8Array, pos: number[], doc: SdcDocumentByte): void {
        while (pos[0] < pos[1]) {
            const lineEnd = this.findLineEnd(data, pos[0], pos[1]);
            const line = new SdcByteView(data, pos[0], lineEnd - pos[0]);

            if (!line.startsWith(this.BLOCK_PREFIX)) {
                pos[0] = this.skipToNextLine(data, lineEnd, pos[1]);
                continue;
            }

            const block = this.parseSdcBlock(data, pos[0], pos[1]);

            const blockId = block.getIdString();
            if (blockId === undefined) {
                continue;
            }
            doc.blocks.set(blockId, block);
            pos[0] = block.nextPos; // Custom field for position tracking
        }
    }

    private parseSdcBlock(data: Uint8Array, startPos: number, end: number): SdcBlockByte {
        const block = new SdcBlockByte();
        const pos = [startPos, end];

        this.parseSdcBlockDefinition(data, pos, block);
        this.parseSdcBlockMetadata(data, pos, block);
        this.parseSdcBlockContent(data, pos, block);

        return block;
    }

    private parseSdcBlockDefinition(data: Uint8Array, pos: number[], block: SdcBlockByte): void {
        const lineEnd = this.findLineEnd(data, pos[0], pos[1]);

        // Parse block ID, optional parentId, and order
        let idStart = pos[0] + this.BLOCK_PREFIX.length;

        // Skip any leading spaces after BLOCK_PREFIX
        let p = idStart;
        while (p < lineEnd && data[p] === 0x20 /* ' ' */) p++;
        idStart = p;

        // Determine order as the last non-space token at the end of the line (if any)
        let r = lineEnd - 1;
        while (r >= idStart && (data[r] === 0x20 || data[r] === 0x0D || data[r] === 0x0A)) {
            r--;
        }
        const orderEnd = r + 1;

        // Find start of last token
        let orderStartCandidate = orderEnd;
        while (orderStartCandidate - 1 >= idStart && data[orderStartCandidate - 1] !== 0x20) {
            orderStartCandidate--;
        }

        // check if there is at least one space separating id-part and last token
        const hasSeparator = orderStartCandidate > idStart && orderStartCandidate - 1 >= idStart && data[orderStartCandidate - 1] === 0x20;
        let idEnd: number;
        if (hasSeparator) {
            // Move left over additional spaces to get a true separator start
            let sepStart = orderStartCandidate - 1;
            while (sepStart - 1 >= idStart && data[sepStart - 1] === 0x20) {
                sepStart--;
            }
            idEnd = sepStart;

            // Set order
            block.order = new SdcByteView(data, orderStartCandidate, orderEnd - orderStartCandidate).trim();
        } else {
            idEnd = orderEnd; // no order; the whole line is id-part
        }

        // Search for the exact "<-" (no surrounding spaces) inside the id segment to split parentId
        let arrowPos = -1;
        for (let i = idStart; i + 1 < idEnd; i++) {
            if (data[i] === 0x3C /* '<' */ && data[i + 1] === 0x2D /* '-' */) {
                // ensure no spaces immediately around arrow: char before '<' and char after '-' cannot be spaces
                const leftOk = i - 1 < idStart || data[i - 1] !== 0x20;
                const rightOk = i + 2 >= idEnd || data[i + 2] !== 0x20;
                if (leftOk && rightOk) {
                    arrowPos = i;
                    break;
                }
            }
        }

        // Split ID / parentId
        if (arrowPos !== -1) {
            // id is left of "<-", parentId is right of it, both trimmed
            block.id = new SdcByteView(data, idStart, arrowPos - idStart).trim();
            const parentStart = arrowPos + 2;
            if (idEnd - parentStart > 0) {
                block.parentId = new SdcByteView(data, parentStart, idEnd - parentStart).trim();
            }
        } else {
            // no parentId, a whole segment is id
            block.id = new SdcByteView(data, idStart, idEnd - idStart).trim();
        }
    }

    private parseSdcBlockMetadata(data: Uint8Array, pos: number[], block: SdcBlockByte): void {
        // Parse block metadata
        let lineEnd: number;

        while (pos[0] < pos[1]) {
            lineEnd = this.findLineEnd(data, pos[0], pos[1]);

            if (lineEnd === pos[0]) {
                pos[0] = this.skipToNextLine(data, lineEnd, pos[1]);
                break;
            }

            const colon = this.findColon(data, pos[0], lineEnd);
            if (colon !== -1) {
                const keyView = new SdcByteView(data, pos[0], colon - pos[0]).trim();
                const valueView = new SdcByteView(data, colon + 1, lineEnd - (colon + 1)).trim();

                block.metadata.set(keyView.toString(), valueView);
            }

            pos[0] = this.skipToNextLine(data, lineEnd, pos[1]);
        }
    }

    private parseSdcBlockContent(data: Uint8Array, pos: number[], block: SdcBlockByte): void {
        const contentType = block.metadata.get("content-type");
        if (contentType === undefined || contentType === null) {
            block.nextPos = pos[0];
            return;
        }

        const contentRange = this.findContentRange(data, pos, block);

        if (contentRange === null) {
            throw new Error("SDC container error: Unable to find content range");
        }

        this.setBlockContent(data, pos, block, contentRange);
    }

    private findContentRange(data: Uint8Array, pos: number[], block: SdcBlockByte): number[] | null {
        // Try content-length first (the fastest method)
        const contentLength = block.metadata.get("content-length");
        if (contentLength !== undefined && contentLength !== null) {
            const range = this.findSdcBlockContentRangeByContentLength(data, pos, block, contentLength.parseInt());
            if (range !== null) {
                return range;
            }
        }

        // Try metadata boundary
        const boundary = block.metadata.get("boundary");
        if (boundary !== undefined && boundary !== null) {
            const boundaryBytes = new TextEncoder().encode(boundary.toString());
            const range = this.findSdcBlockContentRangeByBoundary(data, pos, boundaryBytes);
            if (range !== null) {
                return range;
            }
        }

        // Fall back to the default boundary (block ID)
        const defaultBoundary = new TextEncoder().encode(block.getIdString());
        return this.findSdcBlockContentRangeByBoundary(data, pos, defaultBoundary);
    }

    private setBlockContent(data: Uint8Array, pos: number[], block: SdcBlockByte, contentRange: number[]): void {
        let start = contentRange[0];
        let length = contentRange[1] - contentRange[0];

        if (length < 0) {
            length = 0;
        }

        if (length === 0) {
            block.content = undefined;
        } else {
            const contentSdcByte = new SdcByteView(data, start, length);

            const contentType = block.metadata.get("content-type")?.toString();

            let sdcBlockContentConstructor = contentType ? this.registryBlockType.get(contentType) : undefined;
            if (sdcBlockContentConstructor == undefined) {
                sdcBlockContentConstructor = this.registryBlockType.get("generic");
            }

            if (!sdcBlockContentConstructor) {
                throw new Error(`Unknown content type: ${contentType}`);
            }

            const sdcBlockContent = new sdcBlockContentConstructor();

            if (sdcBlockContent.getContentType() === "generic" && sdcBlockContent instanceof ContentGeneric) {
                sdcBlockContent.setDynamicContentType(contentType ? contentType : "unknown");
            }

            if (this.isMappedContent(sdcBlockContent)) {
                sdcBlockContent.loadFromStringWithMapper(contentSdcByte.toString(), new SdcDocumentMapper(this));
            } else {
                sdcBlockContent.loadFromString(contentSdcByte.toString());
            }

            block.content = sdcBlockContent;
        }

        block.nextPos = pos[0] + length;

        // Skip trailing newline characters
        this.skipTrailingNewlines(data, pos[1], block);
    }

    private skipTrailingNewlines(data: Uint8Array, limit: number, block: SdcBlockByte): void {
        while (block.nextPos < limit) {
            const current = data[block.nextPos];
            if (current !== '\r'.charCodeAt(0) && current !== '\n'.charCodeAt(0)) {
                break;
            }
            block.nextPos++;
        }
    }

    private findSdcBlockContentRangeByContentLength(data: Uint8Array, pos: number[], block: SdcBlockByte, contentLength: number): number[] | null {
        if (contentLength < 0 || pos[0] + contentLength > pos[1]) {
            return null;
        }

        let currentPos = pos[0] + contentLength;
        const limit = pos[1];

        // find end-line -> support \n or \r\n | maks 2 line
        for (let i = 0; i < 2; i++) {
            if (currentPos >= limit) {
                return null;
            }

            const first = data[currentPos];
            const second = (currentPos + 1 < limit) ? data[currentPos + 1] : first;

            // Validation must newline character
            const firstIsNewline = (first === '\n'.charCodeAt(0) || first === '\r'.charCodeAt(0));
            const secondIsNewline = (second === '\n'.charCodeAt(0) || second === '\r'.charCodeAt(0));

            if (!firstIsNewline || !secondIsNewline) {
                return null;
            }

            // Skip \r\n (2 bytes) or single newline (1 byte)
            currentPos += (second !== first) ? 2 : 1;
        }

        const lineEnd = this.findLineEnd(data, currentPos, limit);
        if (!this.isEndArrowRight(data, currentPos, lineEnd)) {
            return null;
        }

        // Extract and validation ID
        const startEndIdPos = currentPos + this.END_ARROW_RIGHT.length;
        const idLength = lineEnd - startEndIdPos;

        if (idLength <= 0) {
            return null;
        }

        // validation ends id with boundary or block.id (default boundary)
        const endId = new SdcByteView(data, startEndIdPos, idLength);
        const dynamicBoundary = block.getMetadataString("boundary");

        if (dynamicBoundary !== undefined && endId.equals(dynamicBoundary) ||
            block.id !== undefined && endId.equalsByteView(block.id)) {
            return [pos[0], pos[0] + contentLength];
        }

        return null;
    }

    private findSdcBlockContentRangeByBoundary(data: Uint8Array, pos: number[], boundary: Uint8Array): number[] | null {
        let start = pos[0];

        while (start < pos[1]) {
            const endRightArrow = this.findEndRightArrow(data, start, pos[1]);
            if (endRightArrow === null) {
                return null;
            }

            if (endRightArrow[0] + (endRightArrow[1] - endRightArrow[0]) >= data.length) {
                return null;
            }

            const startIdPos = endRightArrow[1];
            const endLine = this.findLineEnd(data, startIdPos, pos[1]);

            if (this.compareDataRange(data, startIdPos, endLine, boundary)) {
                let countNewLine = 0;
                for (let i = 1; i <= 2; i++) {
                    const c = data[endRightArrow[0] - i];
                    if (c === '\n'.charCodeAt(0) || c === '\r'.charCodeAt(0)) {
                        countNewLine++;
                    }
                }
                return [pos[0], endRightArrow[0] - countNewLine];
            } else {
                if (endLine >= start) {
                    start = endLine + 1;
                } else if (endRightArrow[1] >= start) {
                    start = endRightArrow[1] + 1;
                } else {
                    break;
                }
            }
        }

        return null;
    }

    private findLineEnd(data: Uint8Array, start: number, end: number): number {
        for (let i = start; i < end; i++) {
            if (data[i] === 10 || data[i] === 13) return i;
        }
        return end;
    }

    private skipToNextLine(data: Uint8Array, pos: number, end: number): number {
        if (pos < end && data[pos] === 13) pos++;
        if (pos < end && data[pos] === 10) pos++;
        return pos;
    }

    private findColon(data: Uint8Array, start: number, end: number): number {
        for (let i = start; i < end; i++) {
            if (data[i] === 58) return i;
        }
        return -1;
    }

    private isEndArrowRight(data: Uint8Array, pos: number, end: number): boolean {
        return new SdcByteView(data, pos, end - pos).startsWith(this.END_ARROW_RIGHT);
    }

    private findEndRightArrow(data: Uint8Array, start: number, end: number): number[] | null {
        for (let i = start; i + 1 < end; i++) {
            if (data[i] === 45 && data[i + 1] === 62) {

                const arrowPos = i - this.END.length;
                if (arrowPos >= 0) {
                    let haveProblem = false;

                    for (let n = 0; n < this.END.length; n++) {
                        if (this.END[n] !== data[arrowPos + n]) {
                            haveProblem = true;
                            break;
                        }
                    }

                    if (!haveProblem) {
                        return [arrowPos, arrowPos + this.END_ARROW_RIGHT.length];
                    }
                }
            }
        }

        return null;
    }

    private compareDataRange(dataRange: Uint8Array | null, start: number, end: number, dataCompare: Uint8Array | null): boolean {
        if (dataRange === null || dataCompare === null ||
            end < start || start < 0 || end > dataRange.length ||
            (end - start) !== dataCompare.length) {
            return false;
        }

        for (let i = 0; i < dataCompare.length; i++) {
            if (dataRange[start + i] !== dataCompare[i]) {
                return false;
            }
        }

        return true;
    }

    private isMappedContent(content: SdcBlockContent<any>): content is SdcBlockContentMapped<any> {
        return typeof (content as any).writeToStringWithMapper === "function";
    }
}
