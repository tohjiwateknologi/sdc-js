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
import {SdcBlockContent} from "./SdcBlockContent";

export class SdcBlockByte {
    public id?: SdcByteView;
    public parentId?: SdcByteView;
    public order?: SdcByteView;
    public metadata: Map<string, SdcByteView>;
    public content?: SdcBlockContent<any>;

    public nextPos: number;

    constructor() {
        this.metadata = new Map();
        this.nextPos = 0;
    }

    getIdString(): string | undefined {
        return this.id ? this.id.toString() : undefined;
    }

    getParentIdString(): string | undefined {
        return this.parentId ? this.parentId.toString() : undefined;
    }

    getOrderString(): string | undefined {
        return this.order ? this.order.toString() : undefined;
    }

    getMetadataString(key: string): string | undefined {
        const value = this.metadata.get(key);
        return value ? value.toString() : undefined;
    }

    getContentByClazz<T>(clazz: new (...args: any[]) => T): T | undefined {
        const content = this.content;
        if (content instanceof clazz) {
            return content as T;
        } else {
            return undefined;
        }
    }
}
