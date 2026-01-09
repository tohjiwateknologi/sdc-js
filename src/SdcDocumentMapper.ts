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

import {SdcBlockContentConstructor, SdcParser} from "./SdcParser";
import {SdcDocument} from "./SdcDocument";

export class SdcDocumentMapper {
    private readonly parser: SdcParser;

    constructor();
    constructor(sdcParser: SdcParser);

    constructor(sdcParser?: SdcParser) {
        if (sdcParser) {
            this.parser = sdcParser;
        } else {
            this.parser = new SdcParser();
        }
    }

    addBlockType(supplier: SdcBlockContentConstructor): void {
        this.parser.addBlockType(supplier);
    }

    readFromString(sdcDocumentStr: string): SdcDocument {
        return new SdcDocument(this.parser.readFromString(sdcDocumentStr));
    }

    writeToString(sdcDocument: SdcDocument): string {
        return this.parser.writeToString(sdcDocument.sdcDocumentByte);
    }
}
