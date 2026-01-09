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

import {SdcBlockByte} from "./SdcBlockByte";
import {SdcByteView} from "./SdcByteView";
import {SdcBlockMetadata} from "./SdcBlockMetadata";
import {SdcBlockContent} from "./SdcBlockContent";

export class SdcBlock {
    private readonly sdcBlockByte: SdcBlockByte;

    constructor(value: string | SdcBlockByte) {
        if (value instanceof SdcBlockByte) {
            this.sdcBlockByte = value;
        } else {
            this.sdcBlockByte = new SdcBlockByte();
            this.sdcBlockByte.id = new SdcByteView(new TextEncoder().encode(value), 0, value.length);
        }
    }

    getSdcBlockByte(): SdcBlockByte {
        return this.sdcBlockByte;
    }

    getId(): string | undefined {
        return this.sdcBlockByte.getIdString();
    }

    setId(id: string): void {
        this.sdcBlockByte.id = new SdcByteView(new TextEncoder().encode(id), 0, id.length);
    }

    getParentId(): string | undefined {
        return this.sdcBlockByte.getParentIdString();
    }

    setParentId(parentId: string | undefined): void {
        if (parentId == undefined) {
            this.sdcBlockByte.parentId = undefined;
            return;
        }

        this.sdcBlockByte.parentId = new SdcByteView(new TextEncoder().encode(parentId), 0, parentId.length);
    }

    getOrder(): string | undefined {
        return this.sdcBlockByte.getOrderString();
    }

    setOrder(order: string | undefined): void {
        if (order == undefined) {
            this.sdcBlockByte.order = undefined;
            return;
        }

        this.sdcBlockByte.order = new SdcByteView(new TextEncoder().encode(order), 0, order.length);
    }

    getMetadata(): SdcBlockMetadata | undefined {
        return this.sdcBlockByte.metadata == undefined ? undefined : new SdcBlockMetadata(this.sdcBlockByte.metadata);
    }

    setMetadata(key: string, value: string): void {
        if (key == null || value == null) {
            return;
        }

        const keyRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        if (!keyRegex.test(key)) {
            throw new Error("metadata key just support [a-z0-9-] and - for separator");
        }

        this.sdcBlockByte.metadata.set(key, new SdcByteView(new TextEncoder().encode(value), 0, value.length));
    }

    getMetadataValue(key: string): string | undefined {
        return this.sdcBlockByte.getMetadataString(key);
    }

    removeMetadata(key: string): void {
        this.sdcBlockByte.metadata.delete(key);
    }

    setContent(content: SdcBlockContent<any> | undefined): void {
        if (content == undefined) {
            this.sdcBlockByte.content = undefined;
            return;
        }

        this.sdcBlockByte.content = content;
    }

    getContent(): SdcBlockContent<any> | undefined {
        return this.sdcBlockByte.content;
    }

    getContentByClazz<T>(clazz: new (...args: any[]) => T): T | undefined {
        return this.sdcBlockByte.getContentByClazz(clazz);
    }
}
