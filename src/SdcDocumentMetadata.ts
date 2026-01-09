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

export class SdcDocumentMetadata implements Iterable<[string, string]> {
    private raw: Map<string, SdcByteView>;

    constructor(raw?: Map<string, SdcByteView>) {
        this.raw = raw ?? new Map();
    }

    get(key: string): string | null {
        const v = this.raw.get(key);
        return v ? v.toString() : null;
    }

    put(key: string, value: string): void {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(value);
        this.raw.set(key, new SdcByteView(bytes, 0, bytes.length));
    }

    remove(key: string): void {
        this.raw.delete(key);
    }

    [Symbol.iterator](): Iterator<[string, string]> {
        const entries = Array.from(this.raw.entries()).map(
            ([k, v]) => [k, v.toString()] as [string, string]
        );
        return entries[Symbol.iterator]();
    }
}
