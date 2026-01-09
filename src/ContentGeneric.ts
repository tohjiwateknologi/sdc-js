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

import {SdcBlockContent} from "./SdcBlockContent";

export class ContentGeneric implements SdcBlockContent<string> {
    static readonly CONTENT_TYPE = "generic";
    CONTENT_TYPE_DYNAMIC = ContentGeneric.CONTENT_TYPE;
    private content: string = "";

    constructor(contentType?: string, content?: string) {
        if (contentType !== undefined) {
            this.CONTENT_TYPE_DYNAMIC = contentType;
        }

        if (content !== undefined) {
            this.set(content);
        }
    }

    writeToString(): string {
        return this.content;
    }

    loadFromString(content: string): void {
        this.content = content;
    }

    get(): string {
        return this.content;
    }

    set(content: string): void {
        this.content = content;
    }

    getContentType(): string {
        return this.CONTENT_TYPE_DYNAMIC;
    }

    setDynamicContentType(contentType: string): void {
        this.CONTENT_TYPE_DYNAMIC = contentType;
    }
}
