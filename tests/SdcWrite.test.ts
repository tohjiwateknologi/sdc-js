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
import {SdcDocumentByte} from "../src/SdcDocumentByte";
import {SdcBlockByte} from "../src/SdcBlockByte";
import {SdcByteView} from "../src/SdcByteView";
import {ContentTextPlain} from "@sdc-js";

describe("SdcWrite", () => {
    test("writeToString: without content", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");

        const block = new SdcBlockByte();
        block.id = SdcByteView.fromString("A");
        block.parentId = SdcByteView.fromString("P");
        block.order = SdcByteView.fromString("a1");
        block.metadata.set("key", SdcByteView.fromString("value"));

        const blockId = block.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const expected = `SDC/1.0

block A<-P a1
key: value
`;

        expect(sdcString).toBe(expected);
    });

    test("writeToString: with content", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");

        const block = new SdcBlockByte();
        block.id = SdcByteView.fromString("A");
        block.parentId = SdcByteView.fromString("P");
        block.order = SdcByteView.fromString("a1");
        block.metadata.set("key", SdcByteView.fromString("value"));
        block.content = new ContentTextPlain("this is content\nbody");

        const blockId = block.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const expected = `SDC/1.0

block A<-P a1
content-type: text/plain
content-length: 20
key: value

this is content
body

end->A
`;

        expect(sdcString).toBe(expected);
    });

    test("writeToString: with ParentId and with Order", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");
        doc.metadata.set("title", SdcByteView.fromString("Doc"));

        const block = new SdcBlockByte();
        block.id = SdcByteView.fromString("A");
        block.parentId = SdcByteView.fromString("P");
        block.order = SdcByteView.fromString("a1");
        block.content = new ContentTextPlain("Hello");
        block.metadata.set("x-extra", SdcByteView.fromString("v"));

        const blockId = block.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const expected = `SDC/1.0
title: Doc

block A<-P a1
content-type: text/plain
content-length: 5
x-extra: v

Hello

end->A
`;
        expect(sdcString).toBe(expected);
    });

    test("writeToString: with ParentId and no Order", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");
        doc.metadata.set("title", SdcByteView.fromString("Doc"));

        const block = new SdcBlockByte();
        block.id = SdcByteView.fromString("A");
        block.parentId = SdcByteView.fromString("P");
        block.content = new ContentTextPlain("Hello");
        block.metadata.set("x-extra", SdcByteView.fromString("v"));

        const blockId = block.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const expected = `SDC/1.0
title: Doc

block A<-P
content-type: text/plain
content-length: 5
x-extra: v

Hello

end->A
`;

        expect(sdcString).toBe(expected);
    });

    test("writeToString: no ParentId and with Order", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");
        doc.metadata.set("title", SdcByteView.fromString("Doc"));

        const block = new SdcBlockByte();
        block.id = SdcByteView.fromString("A");
        block.content = new ContentTextPlain("Hello");
        block.metadata.set("content-type", SdcByteView.fromString("text/plain"));
        block.metadata.set("x-extra", SdcByteView.fromString("v"));

        const blockId = block.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const expected = `SDC/1.0
title: Doc

block A
content-type: text/plain
content-length: 5
x-extra: v

Hello

end->A
`;

        expect(sdcString).toBe(expected);
    });

    test("writeToString: no ParentId and no Order", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");
        doc.metadata.set("author", SdcByteView.fromString("Ana"));

        const block = new SdcBlockByte();
        block.id = SdcByteView.fromString("C1");
        block.content = new ContentTextPlain("Hello");
        block.metadata.set("k", SdcByteView.fromString("v"));

        const blockId = block.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const expected = `SDC/1.0
author: Ana

block C1
content-type: text/plain
content-length: 5
k: v

Hello

end->C1
`;

        expect(sdcString).toBe(expected);
    });

    test("writeToString: preserves extra block meta except computed content-length and ensures lowercase content-type key", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");

        const block = new SdcBlockByte();
        block.id = SdcByteView.fromString("Z");
        block.content = new ContentTextPlain("abc");
        block.metadata.set("content-length", SdcByteView.fromString("999"));
        block.metadata.set("X-Key", SdcByteView.fromString("Up"));

        const blockId = block.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const expected = `SDC/1.0

block Z
content-type: text/plain
content-length: 3
X-Key: Up

abc

end->Z
`;

        expect(sdcString).toBe(expected);
    });

    test("writeToString: parseFromString round-trip for id/parent/order/content/meta", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");
        doc.metadata.set("title", SdcByteView.fromString("Title"));

        const block0 = new SdcBlockByte();
        block0.id = SdcByteView.fromString("abc");
        block0.order = SdcByteView.fromString("a0");
        block0.content = new ContentTextPlain("Hello");
        block0.metadata.set("k1", SdcByteView.fromString("v1"));

        const blockId = block0.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block0);

        const block1 = new SdcBlockByte();
        block1.id = SdcByteView.fromString("cba");
        block1.parentId = SdcByteView.fromString("abc");
        block1.content = new ContentTextPlain("World");

        const blockId2 = block1.getIdString();
        if (blockId2 === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId2, block1);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const parsed: SdcDocumentByte = sdcParser.readFromString(sdcString);

        expect(parsed.getVersionString()).toBe("1.0");
        expect(parsed.getMetadataString("title")).toBe("Title");
        expect(parsed.blocks.size).toBe(2);

        const b0 = parsed.blocks.get("abc");
        if (b0 === undefined) {
            fail("abc block is undefined");
        }

        expect(b0.getIdString()).toBe("abc");
        expect(b0.getParentIdString()).toBeUndefined();
        expect(b0.getOrderString()).toBe("a0");
        expect(b0.getContentByClazz(ContentTextPlain)?.get()).toBe("Hello");
        expect(b0.getMetadataString("content-type")).toBe("text/plain");
        expect(b0.getMetadataString("k1")).toBe("v1");

        const b1 = parsed.blocks.get("cba");
        if (b1 === undefined) {
            fail("cba block is undefined");
        }

        expect(b1.getIdString()).toBe("cba");
        expect(b1.getParentIdString()).toBe("abc");
        expect(b1.getOrderString()).toBeUndefined();
        expect(b1.getContentByClazz(ContentTextPlain)?.get()).toBe("World");
        expect(b1.getMetadataString("content-type")).toBe("text/plain");
    });

    test("writeToString: multiple blocks preserve order and UTF-8 content length correctness", () => {
        const doc = new SdcDocumentByte();
        doc.version = SdcByteView.fromString("1.0");

        const block1 = new SdcBlockByte();
        block1.id = SdcByteView.fromString("id1");
        block1.content = new ContentTextPlain("áéî");

        const blockId = block1.getIdString();
        if (blockId === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId, block1);

        const block2 = new SdcBlockByte();
        block2.id = SdcByteView.fromString("id2");
        block2.parentId = SdcByteView.fromString("id1");
        block2.order = SdcByteView.fromString("a1");
        block2.content = new ContentTextPlain("line1\nline2");
        block2.metadata.set("X-Key", SdcByteView.fromString("V"));

        const blockId2 = block2.getIdString();
        if (blockId2 === undefined) {
            fail("id is undefined");
        }

        doc.blocks.set(blockId2, block2);

        const sdcParser = new SdcParser();
        const sdcString = sdcParser.writeToString(doc);

        const expected = `SDC/1.0

block id1
content-type: text/plain
content-length: 6

áéî

end->id1

block id2<-id1 a1
content-type: text/plain
content-length: 11
X-Key: V

line1
line2

end->id2
`;

        expect(sdcString).toBe(expected);
    });
});
