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

import {SdcParser} from "../src/SdcParser";
import {SdcBlockMetadataKey, SdcDocumentMetadataKey} from "@sdc-js";
import {ContentTextMarkdown} from "@sdc-js";
import {ContentTextPlain} from "@sdc-js";
import {ContentGeneric} from "@sdc-js";

describe("SdcParser", () => {
    test("parseFromString: main example", () => {
        const sdc = `SDC/1.0
title: My Document
author: John
date: 2024-01-01T00:00:00Z
x-extra: abc

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/plain
content-length: 5
key: to

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f88

block 01890d2e7b9c7c7db3a54a6b38cb2f89<-01890d2e7b9c7c7db3a54a6b38cb2f88 a1
content-type: text/plain
key: from

Steve

end->01890d2e7b9c7c7db3a54a6b38cb2f89

block 01890d2e7b9c7c7db3a54a6b38cb2f90<-01890d2e7b9c7c7db3a54a6b38cb2f88 a2
content-type: text/plain
boundary: 01890d2e7b9c7c7db3a54a6b38cb2f99
key: cc

Jobs

end->01890d2e7b9c7c7db3a54a6b38cb2f99
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.getVersionString()).not.toBeNull();
        expect(doc.getVersionString()).toBe("1.0");

        expect(doc.getMetadataString(SdcDocumentMetadataKey.TITLE)).toBe("My Document");
        expect(doc.getMetadataString(SdcDocumentMetadataKey.AUTHOR)).toBe("John");
        expect(doc.getMetadataString(SdcDocumentMetadataKey.DATE)).toBe("2024-01-01T00:00:00Z");
        expect(doc.getMetadataString("x-extra")).toBe("abc");

        expect(doc.blocks.size).toBe(3);

        const block0 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block0 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }

        expect(block0.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block0.getParentIdString()).toBeUndefined();
        expect(block0.getOrderString()).toBe("a0");
        expect(block0.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block0.getContentByClazz(ContentTextPlain)?.get()).toBe("Alice");

        const block1 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f89");
        if (block1 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f89 block not found");
        }

        expect(block1.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f89");
        expect(block1.getParentIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block1.getOrderString()).toBe("a1");
        expect(block1.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block1.getContentByClazz(ContentTextPlain)?.get()).toBe("Steve");
    });

    test("parseFromString: content-length wrong (less) without custom boundary", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/plain
content-length: 4

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f88
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Alice");
    });

    test("parseFromString: content-length wrong (more) without custom boundary", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/plain
content-length: 10

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f88
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Alice");
    });

    test("parseFromString:: content-length wrong (excepted limit) without custom boundary", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/plain
content-length: 9999

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f88
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Alice");
    });

    test("parseFromString: content-length wrong with custom boundary", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/plain
boundary: 01890d2e7b9c7c7db3a54a6b38cb2f99
content-length: 10

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f99
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Alice");
    });

    test("parseFromString: content-length right with custom boundary", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/plain
boundary: 01890d2e7b9c7c7db3a54a6b38cb2f99
content-length: 5

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f99
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Alice");
    });

    test("parseFromString: content-length right with default boundary", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/plain
content-length: 5

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f88
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Alice");
    });

    test("parseFromString:: actual content exist but without content-type -> ", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
key: value

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f88

block 01890d2e7b9c7c7db3a54a6b38cb2f89<-01890d2e7b9c7c7db3a54a6b38cb2f88 a1
content-type: text/plain
key: from

Steve

end->01890d2e7b9c7c7db3a54a6b38cb2f89
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(2);

        const block0 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block0 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block0.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block0.getParentIdString()).toBeUndefined();
        expect(block0.getOrderString()).toBe("a0");
        expect(block0.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBeUndefined();
        expect(block0.getMetadataString("key")).toBe("value");
        expect(block0.getContentByClazz(ContentTextPlain)).toBeUndefined();

        const block1 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f89");
        if (block1 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block1.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f89");
        expect(block1.getParentIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block1.getOrderString()).toBe("a1");
        expect(block1.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block1.getMetadataString("key")).toBe("from");
        expect(block1.getContentByClazz(ContentTextPlain)?.get()).toBe("Steve");
    });

    test("parseFromString: content-length right with wrong boundary", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/plain
content-length: 5

Alice

end->x
`;

        const sdcParser = new SdcParser();
        expect(() => sdcParser.readFromString(sdc)).toThrow(expect.objectContaining({
            name: 'Error',
            message: expect.stringMatching("SDC container error: Unable to find content range")
        }));
    });

    test("parseFromString: more than one block without content, one have metadata and one without", () => {
        const sdc = `SDC/1.0

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
key: value

block 01890d2e7b9c7c7db3a54a6b38cb2f89 a1
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(2);

        const block0 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block0 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block0.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block0.getParentIdString()).toBeUndefined();
        expect(block0.getOrderString()).toBe("a0");
        expect(block0.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBeUndefined();
        expect(block0.getMetadataString("key")).toBe("value");
        expect(block0.getContentByClazz(ContentTextPlain)).toBeUndefined();

        const block1 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f89");
        if (block1 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block1.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f89");
        expect(block1.getOrderString()).toBe("a1");
        expect(block1.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBeUndefined();
    });

    test("parseFromString: more than 1 end-line in doc and block", () => {
        const sdc = `SDC/1.0


block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
key: value


block 01890d2e7b9c7c7db3a54a6b38cb2f89 a1
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.blocks.size).toBe(2);

        const block0 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block0 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block0.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block0.getParentIdString()).toBeUndefined();
        expect(block0.getOrderString()).toBe("a0");
        expect(block0.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBeUndefined();
        expect(block0.getMetadataString("key")).toBe("value");
        expect(block0.getContentByClazz(ContentTextPlain)).toBeUndefined();

        const block1 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f89");
        if (block1 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block1.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f89");
        expect(block1.getOrderString()).toBe("a1");
        expect(block1.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBeUndefined();
    });

    test("parseFromString: just SDC with Doc Metadata", () => {
        const sdc = `SDC/1.0
key: value

`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.getMetadataString("key")).toBe("value");
    });

    test("parseFromString: metadata case sensitive", () => {
        const sdc = `SDC/1.0
KEY1: VALUE1
key2: value2

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
KEY1: VALUE1
key2: value2
content-type: text/plain
content-length: 5

Alice

end->01890d2e7b9c7c7db3a54a6b38cb2f88
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.getMetadataString("KEY1")).toBe("VALUE1");
        expect(doc.getMetadataString("key2")).toBe("value2");
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getMetadataString("KEY1")).toBe("VALUE1");
        expect(block.getMetadataString("key2")).toBe("value2");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Alice");
    });

    test("parseFromString: parse document with meta and multiple blocks, including parentId and order", () => {
        const sdc = `SDC/1.0
title: My Document
author: John
date: 2024-01-01T00:00:00Z
x-extra: abc

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/markdown
content-length: 5
key: to

# Title
Body 1

end->01890d2e7b9c7c7db3a54a6b38cb2f88

block 01890d2e7b9c7c7db3a54a6b38cb2f89<-01890d2e7b9c7c7db3a54a6b38cb2f88 a1
content-type: text/adoc
key: from

== Section
Body 2

end->01890d2e7b9c7c7db3a54a6b38cb2f89
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.getMetadataString("title")).toBe("My Document");
        expect(doc.getMetadataString("author")).toBe("John");
        expect(doc.getMetadataString("date")).toBe("2024-01-01T00:00:00Z");
        expect(doc.getMetadataString("x-extra")).toBe("abc");

        const block0 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block0 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block0.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block0.getParentIdString()).toBeUndefined();
        expect(block0.getOrderString()).toBe("a0");
        expect(block0.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/markdown");
        expect(block0.getMetadataString("key")).toBe("to");
        expect(block0.getContentByClazz(ContentTextMarkdown)?.get()).toBe("# Title\nBody 1");

        const block1 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f89");
        if (block1 === undefined) {
            fail("01890d2e7b9c7c7db3a54a6b38cb2f88 block not found");
        }
        expect(block1.getIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f89");
        expect(block1.getParentIdString()).toBe("01890d2e7b9c7c7db3a54a6b38cb2f88");
        expect(block1.getOrderString()).toBe("a1");
        expect(block1.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/adoc");
        expect(block1.getMetadataString("key")).toBe("from");
        expect(block1.getContentByClazz(ContentGeneric)?.get()).toBe("== Section\nBody 2");
    });

    test("parseFromString: header must start with SDC/ -> invalid header throws IllegalArgumentException", () => {
        const sdc = `UDX/1.0
title: x
`;

        const sdcParser = new SdcParser();

        expect(() => sdcParser.readFromString(sdc)).toThrow(Error);
        expect(() => sdcParser.readFromString(sdc)).toThrow(/Invalid SDC header/i);
    });

    test("parseFromString: missing content-length per block -> fallback to find by boundary", () => {
        const sdc = `SDC/1.0
title: x

block abc a0
content-type: text/plain

Hi

end->abc
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.getVersionString()).toBe("1.0");

        expect(doc.getMetadataString(SdcDocumentMetadataKey.TITLE)).toBe("x");

        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("abc");
        if (block === undefined) {
            fail("abc block not found");
        }

        expect(block.getIdString()).toBe("abc");
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Hi");
    });

    test("parseFromString: missing content-type per block -> content will always null", () => {
        const sdc = `SDC/1.0
title: x

block abc a0
content-length: 2

Hi

end->abc
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.getVersionString()).toBe("1.0");

        expect(doc.getMetadataString(SdcDocumentMetadataKey.TITLE)).toBe("x");

        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("abc");
        if (block === undefined) {
            fail("abc block not found");
        }

        expect(block.getIdString()).toBe("abc");
        expect(block.getOrderString()).toBe("a0");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe(undefined);
        expect(block.getContentByClazz(ContentTextPlain)).toBe(undefined);
    });

    test("parseFromString: content-length exceeds available bytes -> fallback find by boundary", () => {
        const sdc = `SDC/1.0
title: x

block abc
content-type: text/plain
content-length: 10

Hi

end->abc
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.getVersionString()).toBe("1.0");

        expect(doc.getMetadataString(SdcDocumentMetadataKey.TITLE)).toBe("x");

        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("abc");
        if (block === undefined) {
            fail("abc block not found");
        }

        expect(block.getIdString()).toBe("abc");
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Hi");
    });

    test("should handle case-sensitive headers and tolerate whitespace", () => {
        const sdc = `SDC/1.0
Title: T
AUTHOR: A
date: D

block B1 z9
content-type:   text/plain  
\tcontent-length:   5

Hello

end->B1
`;

        const sdcParser = new SdcParser();

        const doc = sdcParser.readFromString(sdc);

        expect(doc.getMetadataString("Title")).toBe("T");
        expect(doc.getMetadataString("AUTHOR")).toBe("A");
        expect(doc.getMetadataString("date")).toBe("D");

        const block = doc.blocks.get("B1");
        if (block === undefined) {
            fail("block not found");
        }

        expect(doc.blocks.size).toBe(1);
        expect(block.getMetadataString(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getOrderString()).toBe("z9");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Hello");
    });

    test("parseFromString: block with content-type but without content", () => {
        const sdc = `SDC/1.1
Title: X

block AA a0
content-type: text/plain

end->AA
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("AA");
        if (block === undefined) {
            fail("block not found");
        }

        expect(block.content).toBe(undefined);
    });

    test("Zero content-length and CRLF newlines", () => {
        const sdc = `SDC/1.1\r
Title: X\r
\r
block AA a0\r
content-type: text/plain\r
content-length: 0\r
\r
end->AA
`; // empty content

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("AA");
        if (block === undefined) {
            fail("block not found");
        }

        expect(block.content).toBe(undefined);
    });

    test("Malformed metadata line without colon in doc meta should be ignored", () => {
        const sdc = `SDC/1.0
        good: ok
        Bad meta line without colon
        
        block A a0
        content-type: x/y
        
        C
        
        end->A
        `;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.getMetadataString("good")).toBe("ok");
        expect(doc.getMetadataString("bad meta line without colon")).toBeUndefined();
    });

    test("parseFromString: block headers must end with an empty line; otherwise, the first content line is treated as header and likely fails", () => {
        const sdc = `SDC/1.0

block Z a0
content-type: text/plain
Hello
end->Z
`;

        const sdcParser = new SdcParser();

        expect(() => sdcParser.readFromString(sdc)).toThrow(Error);
        expect(() => sdcParser.readFromString(sdc)).toThrow("SDC container error: Unable to find content range");
    });

    test("Document without optional meta should still parse", () => {
        const sdc = `SDC/1.0

block B a0
content-type: t/x
content-length: 1

X

end->B
`;

        const sdcParser = new SdcParser();

        const doc = sdcParser.readFromString(sdc);

        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.metadata.size).toBe(0); // metadata.isEmpty()
        expect(doc.blocks.size).toBe(1);
    });

    test("parentId present but order missing -> order null, parent kept", () => {
        const sdc = `SDC/1.0

block child<-root
content-type: text/plain
content-length: 1

X

end->child
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.blocks.size).toBe(1);
        const block = doc.blocks.get("child");
        if (block === undefined) {
            fail("block not found");
        }

        expect(block.getIdString()).toBe("child");
        expect(block.getParentIdString()).toBe("root");
        expect(block.getOrderString()).toBeUndefined();
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("X");
    });

    test("order present but no parentId (simple id and order)", () => {
        const sdc = `SDC/1.0

block abc a9
content-type: text/plain
content-length: 1

x

end->abc
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        const block = doc.blocks.get("abc");
        if (block === undefined) {
            throw new Error("block not found");
        }

        expect(block.getIdString()).toBe("abc");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a9");
    });

    test("parseFromString: malformed block id-part with empty id -> the block will skip even it have actual content", () => {
        const sdc = `SDC/1.0

block
content-type: text/plain

x

end->
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.blocks.size).toBe(0);
    });

    test("parseFromString: malformed parent id-part with empty id -> id becomes null", () => {
        const sdc = `SDC/1.0

block abc<-
content-type: t/x

Q

end->abc
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        const block = doc.blocks.get("abc");
        expect(block?.getParentIdString()).toBeUndefined();
    });

    test("parseFromString: malformed block id with space -> next part of id include in order", () => {
        const sdc = `SDC/1.0

block abc abc<-cba
content-type: t/x

Q

end->abc
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("abc");
        expect(block?.getIdString()).toBe("abc");
        expect(block?.getOrderString()).toBe("abc<-cba");
    });

    test("malformed id-part with empty parentId after '<-' -> parentId becomes empty string", () => {
        const sdc = `SDC/1.0

block child<-
content-type: t/x
content-length: 1

X

end->child
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        const block = doc.blocks.get("child");
        if (block === undefined) {
            throw new Error("block not found");
        }

        expect(block.getIdString()).toBe("child");
        // Parser trims; empty tail becomes empty string
        expect(block.getParentIdString()).toBe(undefined);
        expect(block.getOrderString()).toBeUndefined();
    });

    test("malformed id-part with empty id before '<-' -> id becomes empty string, parent set", () => {
        const sdc = `SDC/1.0

block <-parent
content-type: t/x
content-length: 1

Q

end->
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        const block = doc.blocks.get("");
        if (block === undefined) {
            throw new Error("block not found");
        }

        expect(block.getIdString()).toBe("");
        expect(block.getParentIdString()).toBe("parent");
        expect(block.getOrderString()).toBeUndefined();
    });

    test("spaces around arrow 'child <- parent' not recognized as arrow -> entire id contains spaces, no parent", () => {
        const sdc = `SDC/1.0

block child <- parent a1
content-type: t/x
content-length: 1

C

end->child <- parent
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);
        const block = doc.blocks.get("child <- parent");

        if (block === undefined) {
            throw new Error("block not found");
        }

        expect(block.getIdString()).toBe("child <- parent");
        expect(block.getParentIdString()).toBeUndefined();
        expect(block.getOrderString()).toBe("a1");
    });

    test("parseFromString: duplicate block IDs are not allowed, the second operation will overwrite the old one", () => {
        const sdc = `SDC/1.0

block abc1 a0
content-type: text/plain
content-length: 5

First

end->abc1

block abc1 a1
content-type: text/plain
content-length: 6

Second

end->abc1
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("abc1");
        if (block === undefined) {
            fail("block not found");
        }

        expect(block.getIdString()).toBe("abc1");
        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Second");
    });

    test("parseFromString: unicode meta keys/values and content with colon in value", () => {
        const sdc = `SDC/1.0
títle: Döcümènt: V1
author: Name:FullName

block IDX a0
content-type: text/plain
content-length: 11

Halo: Dunia

end->IDX
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.getVersionString()).toBe("1.0");
        expect(doc.getMetadataString("títle")).toBe("Döcümènt: V1");
        expect(doc.getMetadataString("author")).toBe("Name:FullName");
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("IDX");
        if (block === undefined) {
            fail("block not found");
        }

        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("Halo: Dunia");
    });

    test("parseFromString: invalid content-length (negative) -> treated as 1 or 0", () => {
        const sdc = `SDC/1.0

block A a0
content-type: text/plain
content-length: -2

XYZ

end->A
`;

        const sdcParser = new SdcParser();

        const doc = sdcParser.readFromString(sdc);
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("A");
        if (block === undefined) {
            fail("block not found");
        }

        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("XYZ");
    });

    test("parseFromString: invalid content-length (not match) -> treated as 1 or 0", () => {
        const sdc = `SDC/1.0

block A a0
content-type: text/plain
content-length: 2

XYZ

end->A
`;

        const sdcParser = new SdcParser();

        const doc = sdcParser.readFromString(sdc);
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("A");
        if (block === undefined) {
            fail("block not found");
        }

        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("XYZ");
    });

    test("parseFromString: invalid content-length ( non-numeric) -> treated as 1 or 0", () => {
        const sdc = `SDC/1.0

block A a0
content-type: text/plain
content-length: NaN

X

end->A
`;

        const sdcParser = new SdcParser();

        const doc = sdcParser.readFromString(sdc);
        expect(doc.blocks.size).toBe(1);

        const block = doc.blocks.get("A");
        if (block === undefined) {
            fail("block not found");
        }

        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("X");
    });

    test("Round-trip: complex doc with three blocks, parents and orders", () => {
        const sdc = `SDC/1.0
owner: Me

block R a0
content-type: t/x
content-length: 4

root

end->R

block C1<-R a1
content-type: t/x
content-length: 6

child1

end->C1

block C2<-R
content-type: t/x
content-length: 6

child2

end->C2
`;

        const sdcParser = new SdcParser();

        const doc = sdcParser.readFromString(sdc);
        const out = sdcParser.writeToString(doc);
        const again = sdcParser.readFromString(out);

        expect(again.getVersionString()).toBe("1.0");
        expect(again.getMetadataString("owner")).toBe("Me");
        expect(again.blocks.size).toBe(3);


        const block0 = doc.blocks.get("R");
        if (block0 === undefined) {
            fail("block not found");
        }
        expect(block0.getIdString()).toBe("R");

        const block1 = doc.blocks.get("C1");
        if (block1 === undefined) {
            fail("block not found");
        }
        expect(block1.getIdString()).toBe("C1");
        expect(block1.getParentIdString()).toBe("R");
        expect(block1.getOrderString()).toBe("a1");

        const block2 = doc.blocks.get("C2");
        if (block2 === undefined) {
            fail("block not found");
        }
        expect(block2.getIdString()).toBe("C2");
        expect(block2.getParentIdString()).toBe("R");
        expect(block2.getOrderString()).toBeUndefined();
    });

    test("parseFromString: ignore unknown lines between blocks (robustness)", () => {
        const sdc = `SDC/1.0

block A a0
content-type: text/plain

X

end->A
garbage line that should be skipped
block B a1
content-type: text/plain

Y

end->B
`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        expect(doc.blocks.size).toBe(2);

        const block0 = doc.blocks.get("A");
        if (block0 === undefined) {
            fail("block not found");
        }
        expect(block0.getIdString()).toBe("A");
        expect(block0.getContentByClazz(ContentTextPlain)?.get()).toBe("X");

        const block1 = doc.blocks.get("B");
        if (block1 === undefined) {
            fail("block not found");
        }
        expect(block1.getIdString()).toBe("B");
        expect(block1.getContentByClazz(ContentTextPlain)?.get()).toBe("Y");
    });

    test("parseFromString: block without closing and without content length -> IOException", () => {
        const sdc = `SDC/1.0

block A
content-type: t/x

X
`;

        const sdcParser = new SdcParser();

        expect(() => sdcParser.readFromString(sdc)).toThrow(expect.objectContaining({
            name: 'Error',
            message: expect.stringMatching(/^SDC container error: Unable to find content range/)
        }));
    });

    test("parseFromString: block without closing and with content length -> IOException", () => {
        const sdc = `SDC/1.0

block A
content-type: t/x
content-length: 1

X
`;

        const sdcParser = new SdcParser();

        expect(() => sdcParser.readFromString(sdc)).toThrow(expect.objectContaining({
            name: 'Error',
            message: expect.stringMatching(/^SDC container error: Unable to find content range/)
        }));
    });

    test("parseFromString: CRLF handling in blocks with non-zero content", () => {
        const sdc = `SDC/1.0\r\n\r\nblock A a0\r\ncontent-type: text/plain\r\ncontent-length: 5\r\n\r\nhello\r\n\r\nend->A\r\n`;

        const sdcParser = new SdcParser();
        const doc = sdcParser.readFromString(sdc);

        const block = doc.blocks.get("A");
        if (block === undefined) {
            throw new Error("block not found");
        }

        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("hello");
    });

    test("parseFromString: parse document and make sure the document parse to right object", () => {
        const sdc = `SDC/1.0
title: My Document
author: John
date: 2024-01-01T00:00:00Z
x-extra: abc

block 01890d2e7b9c7c7db3a54a6b38cb2f88 a0
content-type: text/markdown
content-length: 5
key: to

# Title
Body 1

end->01890d2e7b9c7c7db3a54a6b38cb2f88

block 01890d2e7b9c7c7db3a54a6b38cb2f89<-01890d2e7b9c7c7db3a54a6b38cb2f88 a1
content-type: text/plain
key: from

== Section
Body 2

end->01890d2e7b9c7c7db3a54a6b38cb2f89

block 01890d2e7b9c7c7db3a54a6b38cb2f90 a2
content-type: text/adoc
key: from

== Section
Body 2

end->01890d2e7b9c7c7db3a54a6b38cb2f90
`;

        const sdcParser = new SdcParser();

        const doc = sdcParser.readFromString(sdc);

        const block1 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f88");
        if (block1 === undefined) {
            fail("block not found");
        }
        if (!(block1.content instanceof ContentTextMarkdown)) {
            fail("Content is not of type ContentTextMarkdown");
        }

        const block2 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f89");
        if (block2 === undefined) {
            fail("block not found");
        }
        if (!(block2.content instanceof ContentTextPlain)) {
            fail("Content is not of type ContentTextPlain");
        }

        const block3 = doc.blocks.get("01890d2e7b9c7c7db3a54a6b38cb2f90");
        if (block3 === undefined) {
            fail("block not found");
        }
        if (!(block3.content instanceof ContentGeneric)) {
            fail("Content is not of type ContentGeneric");
        }
    });
});
