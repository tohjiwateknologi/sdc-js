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
import {SdcBlock} from "./SdcBlock";
import {SdcDocumentByte} from "./SdcDocumentByte";
import {SdcDocumentMetadata} from "./SdcDocumentMetadata";

export class SdcDocument {
    readonly sdcDocumentByte: SdcDocumentByte;

    constructor(sdcDocumentByte?: SdcDocumentByte) {
        this.sdcDocumentByte = sdcDocumentByte ?? new SdcDocumentByte();

        if (!sdcDocumentByte) {
            const version = "1.0";
            const encoder = new TextEncoder();
            const bytes = encoder.encode(version);
            this.sdcDocumentByte.version = new SdcByteView(bytes, 0, version.length);
        }
    }

    getVersion(): string | undefined {
        return this.sdcDocumentByte.getVersionString();
    }

    getMetadata(): SdcDocumentMetadata | undefined {
        return this.sdcDocumentByte.metadata == undefined ? undefined : new SdcDocumentMetadata(this.sdcDocumentByte.metadata);
    }

    getMetadataValue(key: string): string | undefined {
        return this.sdcDocumentByte.getMetadataString(key);
    }

    public setMetadata(key: string, value: string): void {
        if (key == null || value == null) {
            return;
        }

        const keyRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        if (!keyRegex.test(key)) {
            throw new Error("metadata key just support [a-z0-9-] and - for separator");
        }

        if (this.sdcDocumentByte.metadata === null) {
            this.sdcDocumentByte.metadata = new Map();
        }

        const encoder = new TextEncoder();
        const bytes = encoder.encode(value);

        this.sdcDocumentByte.metadata.set(key, new SdcByteView(bytes, 0, bytes.length));
    }

    removeMetadata(key: string): void {
        if (this.sdcDocumentByte.metadata == undefined) return;
        this.sdcDocumentByte.metadata.delete(key);
    }

    getBlocks(): Map<string, SdcBlock> {
        const sdcBlocks = new Map<string, SdcBlock>();

        this.sdcDocumentByte.blocks.forEach((block) => {
                const key = block.getIdString();
                if (key != undefined) {
                    sdcBlocks.set(key, new SdcBlock(block));
                }
            }
        );

        return sdcBlocks;
    }

    getBlockCount(): number {
        return this.sdcDocumentByte.blocks?.size ?? 0;
    }

    getBlockById(id: string): SdcBlock | undefined {
        const sdcBlockByte = this.sdcDocumentByte.blocks.get(id);

        if (sdcBlockByte == undefined) {
            return undefined;
        }

        return new SdcBlock(sdcBlockByte);
    }

    addBlock(sdcBlock: SdcBlock): void {
        if(sdcBlock == null) return;

        const id = sdcBlock.getId();

        if (id == undefined) {
            return;
        }

        if (id?.includes(" ")) {
            throw new Error("block id can not contains space");
        }

        this.sdcDocumentByte.blocks.set(id, sdcBlock.getSdcBlockByte());
    }

    removeBlock(id: string): void {
        this.sdcDocumentByte.blocks.delete(id);
    }

    getBlockParentOf(sdcBlock: SdcBlock): SdcBlock | undefined {
        const parentId = sdcBlock.getParentId();
        if (parentId == null) return undefined;

        const blockByte = this.sdcDocumentByte.blocks.get(parentId);
        if (blockByte == undefined) return undefined;

        return new SdcBlock(blockByte);
    }

    getBlockChildOf(sdcBlock: SdcBlock): Map<string, SdcBlock> {
        if (sdcBlock.getId() == null) return new Map();

        const result = new Map<string, SdcBlock>();

        for (const [key, value] of this.sdcDocumentByte.blocks.entries()) {
            if (sdcBlock.getId() === value.getParentIdString()) {
                result.set(key, new SdcBlock(value));
            }
        }

        return result;
    }

    getBlockByMetadata(key: string, value: string): Map<string, SdcBlock> {
        if (key == null || value == null) return new Map();

        const result = new Map<string, SdcBlock>();

        for (const [blockKey, blockValue] of this.sdcDocumentByte.blocks.entries()) {
            if (value === blockValue.getMetadataString(key)) {
                result.set(blockKey, new SdcBlock(blockValue));
            }
        }

        return result;
    }
}
