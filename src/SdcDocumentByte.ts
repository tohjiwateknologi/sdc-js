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

export class SdcDocumentByte {
    public version?: SdcByteView;
    public metadata: Map<string, SdcByteView>;
    public blocks: Map<string, SdcBlockByte>;

    constructor() {
        this.metadata = new Map();
        this.blocks = new Map();
    }

    getVersionString(): string | undefined {
        return this.version ? this.version.toString() : undefined;
    }

    getMetadataString(key: string): string | undefined {
        const value = this.metadata.get(key);
        return value ? value.toString() : undefined;
    }
}
