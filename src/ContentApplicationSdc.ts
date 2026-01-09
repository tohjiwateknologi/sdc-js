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

import {SdcDocument} from "./SdcDocument";
import {SdcDocumentMapper} from "./SdcDocumentMapper";
import {SdcBlockContentMapped} from "./SdcBlockContentMapped";

export class ContentApplicationSdc implements SdcBlockContentMapped<SdcDocument> {
    static readonly CONTENT_TYPE = "application/sdc";
    private sdcDocument: SdcDocument | undefined;

    constructor(sdcDocument?: SdcDocument) {
        if (sdcDocument !== undefined) {
            this.set(sdcDocument);
        }
    }

    writeToStringWithMapper(sdcDocumentMapper: SdcDocumentMapper): string {
        return sdcDocumentMapper.writeToString(this.sdcDocument!);
    }

    loadFromStringWithMapper(content: string, sdcDocumentMapper: SdcDocumentMapper): void {
        this.sdcDocument = sdcDocumentMapper.readFromString(content);
    }

    writeToString(): string {
        throw new Error("Mapper required");
    }

    loadFromString(content: string): void {
        throw new Error("Mapper required");
    }

    get(): SdcDocument | undefined {
        return this.sdcDocument;
    }

    set(sdcDocument: SdcDocument): void {
        this.sdcDocument = sdcDocument;
    }

    getContentType(): string {
        return ContentApplicationSdc.CONTENT_TYPE;
    }
}
