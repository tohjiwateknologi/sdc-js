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

export class SdcByteView {
    private readonly data: Uint8Array;
    private readonly offset: number;
    private readonly lengthValue: number;

    constructor(data: Uint8Array, offset: number, length: number) {
        this.data = data;
        this.offset = offset;
        this.lengthValue = length;
    }

    public static fromString(data: string): SdcByteView {
        const bytes = new TextEncoder().encode(data);
        return new SdcByteView(bytes, 0, bytes.length);
    }

    length(): number {
        return this.lengthValue;
    }

    byteAt(index: number): number {
        return this.data[this.offset + index];
    }

    startsWith(prefix: Uint8Array): boolean {
        if (this.lengthValue < prefix.length) return false;
        for (let i = 0; i < prefix.length; i++) {
            if (this.data[this.offset + i] !== prefix[i]) return false;
        }
        return true;
    }

    substring(start: number, end?: number): SdcByteView {
        if (end === undefined) {
            return new SdcByteView(this.data, this.offset + start, this.lengthValue - start);
        }
        return new SdcByteView(this.data, this.offset + start, end - start);
    }

    trim(): SdcByteView {
        let start = 0;
        let end = this.lengthValue;

        while (start < end && this.isWhitespace(this.data[this.offset + start])) {
            start++;
        }

        while (end > start && this.isWhitespace(this.data[this.offset + end - 1])) {
            end--;
        }

        return new SdcByteView(this.data, this.offset + start, end - start);
    }

    private isWhitespace(b: number): boolean {
        return b === 0x20 || b === 0x09 || b === 0x0d || b === 0x0a; // space, tab, \r, \n
    }

    parseInt(): number {
        let result = 0;
        for (let i = 0; i < this.lengthValue; i++) {
            const b = this.data[this.offset + i];
            if (b >= 0x30 && b <= 0x39) {
                result = result * 10 + (b - 0x30);
            } else if (b === 0x20) {
                break;
            }
        }
        return result;
    }

    toString(): string {
        return new TextDecoder("utf-8").decode(this.data.subarray(this.offset, this.offset + this.lengthValue));
    }

    public equals(str: string): boolean {
        const encoder = new TextEncoder();
        const strBytes = encoder.encode(str);

        return this.equalsBytes(strBytes);
    }

    public equalsBytes(strBytes: Uint8Array): boolean {
        if (this.lengthValue != strBytes.length) return false;
        for (let i = 0; i < this.lengthValue; i++) {
            if (this.data[this.offset + i] !== strBytes[i]) return false;
        }

        return true;
    }

    public equalsByteView(byteView: SdcByteView): boolean {
        if (this.lengthValue !== byteView.length()) return false;
        for (let i = 0; i < this.lengthValue; i++) {
            if (this.data[this.offset + i] !== byteView.data[byteView.offset + i]) return false;
        }

        return true;
    }
}
