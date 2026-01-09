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

import type {SdcBlockContent} from '@sdc-js';

export class ContentApplicationJson implements SdcBlockContent<any> {
    static readonly CONTENT_TYPE = 'application/json';
    private content: any;

    constructor(content?: any) {
        this.set(content);
    }

    writeToString(): string {
        return JSON.stringify(this.content);
    }

    loadFromString(content: string): void {
        this.content = JSON.parse(content);
    }

    get(): any {
        return this.content;
    }

    set(content: any): void {
        this.content = content;
    }

    getContentType(): string {
        return ContentApplicationJson.CONTENT_TYPE;
    }
}
