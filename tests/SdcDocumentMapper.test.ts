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

import {
    ContentApplicationSdc,
    ContentGeneric,
    ContentTextMarkdown,
    ContentTextPlain,
    SdcBlock,
    SdcBlockMetadataKey,
    SdcDocument,
    SdcDocumentMapper,
    SdcDocumentMetadataKey
} from "@sdc-js";
import {ContentPrimitiveInteger} from "./ContentPrimitiveInteger";
import {ContentApplicationJson} from "./ContentApplicationJson";

describe("SdcDocumentMapper", () => {
    test("writeToString: main example to write SDC", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const block0 = new SdcBlock("123");
        block0.setParentId("456");
        block0.setOrder("789");
        block0.setMetadata("test-block-meta", "this is the value of doc meta");
        block0.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block0);

        const block1 = new SdcBlock("123c");
        block1.setParentId("123");
        block1.setOrder("789");
        block1.setMetadata("test-block-meta", "this is the value of doc meta");
        block1.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block1);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123

block 123c<-123 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123c
`;

        expect(sdcString).toBe(expected);
    });

    test("writeToString: main example 1 to write SDC", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const abcId = crypto.randomUUID();
        const block = new SdcBlock(abcId);
        block.setParentId("456");
        block.setOrder("789");
        block.setMetadata("test-block-meta", "this is the value of doc meta");
        block.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block ${abcId}<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->${abcId}
`;

        expect(sdcString).toBe(expected);
    });

    test("set block id", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const block0 = new SdcBlock("123");
        block0.setParentId("456");
        block0.setOrder("789");
        block0.setMetadata("test-block-meta", "this is the value of doc meta");
        block0.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block0);

        const block1 = new SdcBlock("123c");
        block1.setId("this-is-block-2");
        block1.setParentId("123");
        block1.setOrder("789");
        block1.setMetadata("test-block-meta", "this is the value of doc meta");
        block1.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block1);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123

block this-is-block-2<-123 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->this-is-block-2
`;

        expect(sdcString).toBe(expected);
    });

    test("remove doc metadata", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");
        doc.setMetadata("test-doc-meta-removed", "this is the value of doc meta");

        doc.removeMetadata("test-doc-meta-removed");

        const block = new SdcBlock("123");
        block.setParentId("456");
        block.setOrder("789");
        block.setMetadata("test-block-meta", "this is the value of doc meta");
        block.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("remove doc meta via metadata", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");
        doc.setMetadata("test-doc-meta-removed", "this is the value of doc meta");

        doc.getMetadata()?.remove("test-doc-meta-removed");

        const block = new SdcBlock("123");
        block.setParentId("456");
        block.setOrder("789");
        block.setMetadata("test-block-meta", "this is the value of doc meta");
        block.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("edit block in list", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const block0 = new SdcBlock("123");
        block0.setParentId("456");
        block0.setOrder("789");
        block0.setMetadata("test-block-meta", "this is the value of doc meta");
        block0.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block0);

        const block1 = new SdcBlock("123c");
        block1.setParentId("123");
        block1.setOrder("789");
        block1.setMetadata("test-block-meta", "this is the value of doc meta");
        block1.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block1);

        doc.getBlocks().forEach(block => {
            block.setMetadata("test-edited", "this is edited block");
        });

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta
test-edited: this is edited block

This is description of the document and it can be long as you want it.

end->123

block 123c<-123 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta
test-edited: this is edited block

This is description of the document and it can be long as you want it.

end->123c
`;

        expect(sdcString).toBe(expected);
    });

    test("edit doc metadata", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const block = new SdcBlock("123");
        block.setParentId("456");
        block.setOrder("789");
        block.setMetadata("test-block-meta", "this is the value of doc meta");
        block.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);

        doc.getMetadata()?.put("test-edited", "this is edited doc meta");

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta
test-edited: this is edited doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("edit block metadata", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const block0 = new SdcBlock("123");
        block0.setParentId("456");
        block0.setOrder("789");
        block0.setMetadata("test-block-meta", "this is the value of doc meta");
        block0.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block0);

        const block1 = doc.getBlockById("123");
        if (block1 === undefined) {
            fail("Block 123 not found");
        }

        block1.getMetadata()?.put("test-block-meta-edited", "this is edited block meta");

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta
test-block-meta-edited: this is edited block meta

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("remove block metadata", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const block0 = new SdcBlock("123");
        block0.setParentId("456");
        block0.setOrder("789");
        block0.setMetadata("test-block-meta", "this is the value of doc meta");
        block0.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block0);

        const block1 = doc.getBlockById("123");
        if (block1 === undefined) {
            fail("Block 123 not found");
        }

        block1.getMetadata()?.put("test-block-meta-edited", "this is edited block meta");
        block1.removeMetadata("test-block-meta-edited");

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("should remove block metadata via metadata map", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const block0 = new SdcBlock("123");
        block0.setParentId("456");
        block0.setOrder("789");
        block0.setMetadata("test-block-meta", "this is the value of doc meta");
        block0.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block0);

        const block1 = doc.getBlockById("123");
        if (block1 === undefined) {
            fail("Block 123 not found");
        }

        block1.getMetadata()?.put("test-block-meta-edited", "this is edited block meta");
        block1.getMetadata()?.remove("test-block-meta-edited");

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("should remove a block correctly", () => {
        const doc = new SdcDocument();
        doc.setMetadata(SdcDocumentMetadataKey.AUTHOR, "Eric A. Sanjaya");
        doc.setMetadata(SdcDocumentMetadataKey.TITLE, "SDC Specification");
        doc.setMetadata("test-doc-meta", "this is the value of doc meta");

        const block0 = new SdcBlock("123");
        block0.setParentId("456");
        block0.setOrder("789");
        block0.setMetadata("test-block-meta", "this is the value of doc meta");
        block0.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block0);

        const block1 = new SdcBlock("will-remove");
        block1.setParentId("456");
        block1.setOrder("789");
        block1.setMetadata("test-block-meta", "this is the value of doc meta");
        block1.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block1);

        doc.removeBlock("will-remove");

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
author: Eric A. Sanjaya
title: SDC Specification
test-doc-meta: this is the value of doc meta

block 123<-456 789
content-type: text/markdown
content-length: 70
test-block-meta: this is the value of doc meta

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("programmatic -> write -> parse -> equals", () => {
        const doc = new SdcDocument();
        doc.setMetadata("title", "Doc");
        doc.setMetadata("author", "Ana");

        const root = new SdcBlock("root");
        root.setOrder("a0");
        root.setMetadata("k1", "v1");
        root.setMetadata(SdcBlockMetadataKey.CONTENT_TYPE, "text/plain");
        root.setContent(new ContentTextPlain("hello"));
        doc.addBlock(root);

        const child = new SdcBlock("child");
        child.setParentId("root");
        child.setContent(new ContentTextPlain("world")); // default type expected on writing
        doc.addBlock(child);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const parsed = mapper.readFromString(sdcString);

        expect(parsed.getVersion()).toBe("1.0");
        expect(parsed.getMetadataValue("title")).toBe("Doc");
        expect(parsed.getMetadataValue("author")).toBe("Ana");
        expect(parsed.getBlockCount()).toBe(2);

        const block0 = parsed.getBlockById("root");
        if (block0 === undefined) {
            fail("Block root not found");
        }

        expect(block0.getId()).toBe("root");
        expect(block0.getParentId()).toBeUndefined();
        expect(block0.getOrder()).toBe("a0");

        expect(block0.getContentByClazz(ContentTextPlain)?.get()).toBe("hello");


        expect(block0.getMetadataValue(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block0.getMetadataValue("k1")).toBe("v1");

        const block1 = parsed.getBlockById("child");
        if (block1 === undefined) {
            fail("Block child not found");
        }

        expect(block1.getId()).toBe("child");
        expect(block1.getParentId()).toBe("root");
        expect(block1.getOrder()).toBeUndefined();
        expect(block1.getContentByClazz(ContentTextPlain)?.get()).toBe("world");
        expect(block1.getMetadataValue(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
    });

    test("parseFromString: build from string with combinations of parent/order/content", () => {
        const sdcString = `SDC/1.0
title: T

block A<-P a1
content-type: text/plain
content-length: 1

X

end->A

block B<-A
content-type: text/plain
content-length: 0

end->B

block C z9
content-type: application/json
content-length: 2

{}

end->C

block D
content-type: application/octet-stream
content-length: 0

end->D
`;

        const mapper = new SdcDocumentMapper();
        const doc = mapper.readFromString(sdcString);

        expect(doc.getVersion()).toBe("1.0");
        expect(doc.getMetadataValue("title")).toBe("T");
        expect(doc.getBlockCount()).toBe(4);

        const block0 = doc.getBlockById("A");
        if (block0 === undefined) {
            fail("Block A not found");
        }

        expect(block0.getId()).toBe("A");
        expect(block0.getParentId()).toBe("P");
        expect(block0.getOrder()).toBe("a1");
        expect(block0.getContentByClazz(ContentTextPlain)?.get()).toBe("X");

        const block1 = doc.getBlockById("B");
        if (block1 === undefined) {
            fail("Block B not found");
        }

        expect(block1.getId()).toBe("B");
        expect(block1.getParentId()).toBe("A");
        expect(block1.getOrder()).toBeUndefined();
        expect(block1.getContent()).toBe(undefined);

        const block2 = doc.getBlockById("C");
        if (block2 === undefined) {
            fail("Block C not found");
        }
        expect(block2.getId()).toBe("C");
        expect(block2.getParentId()).toBeUndefined();
        expect(block2.getOrder()).toBe("z9");
        expect(block2.getContentByClazz(ContentGeneric)?.get()).toBe("{}");

        const block3 = doc.getBlockById("D");
        if (block3 === undefined) {
            fail("Block D not found");
        }

        expect(block3.getId()).toBe("D");
        expect(block3.getParentId()).toBeUndefined();
        expect(block3.getOrder()).toBeUndefined();
        expect(block3.getContent()).toBe(undefined);
    });

    test("Mapper parseFromString: build from string with nested SDC", () => {
        const sdcString = `SDC/1.0
title: Title

block A<-P a1
content-type: application/sdc

SDC/1.0

block Test
content-type: text/plain
content-length: 1

X

end->Test


end->A

block B<-A
content-type: text/x
content-length: 0

end->B

block C z9
content-type: application/json
content-length: 2

{}

end->C

block D
content-type: application/octet-stream
content-length: 0

end->D
`;

        const mapper = new SdcDocumentMapper();
        const doc = mapper.readFromString(sdcString);

        expect(doc.getVersion()).toBe("1.0");
        expect(doc.getMetadataValue("title")).toBe("Title");
        expect(doc.getBlockCount()).toBe(4);

        const block0Content = `SDC/1.0

block Test
content-type: text/plain
content-length: 1

X

end->Test
`;

        const block0 = doc.getBlockById("A");
        if (block0 === undefined) {
            fail("Block not found");
        }

        expect(block0.getId()).toBe("A");
        expect(block0.getParentId()).toBe("P");
        expect(block0.getOrder()).toBe("a1");

        const doc2 = block0.getContentByClazz(ContentApplicationSdc)?.get();
        if (doc2 === undefined) {
            fail("Block A content not found");
        }
        expect(mapper.writeToString(doc2)).toBe(block0Content);

        const block1 = doc.getBlockById("B");
        if (block1 === undefined) {
            fail("Block B not found");
        }

        expect(block1.getId()).toBe("B");
        expect(block1.getParentId()).toBe("A");
        expect(block1.getOrder()).toBeUndefined();
        expect(block1.getContent()).toBe(undefined);

        const block2 = doc.getBlockById("C");
        if (block2 === undefined) {
            fail("Block C not found");
        }
        expect(block2.getId()).toBe("C");
        expect(block2.getParentId()).toBeUndefined();
        expect(block2.getOrder()).toBe("z9");
        expect(block2.getContentByClazz(ContentGeneric)?.get()).toBe("{}");

        const block3 = doc.getBlockById("D");
        if (block3 === undefined) {
            fail("Block D not found");
        }

        expect(block3.getId()).toBe("D");
        expect(block3.getParentId()).toBeUndefined();
        expect(block3.getOrder()).toBeUndefined();
        expect(block3.getContent()).toBe(undefined);
    });

    test("Mapper get data: get parent", () => {
        const sdcString = `SDC/1.0
title: Title

block A a0
content-type: text/plain

This is content of the block A.

end->A

block B<-A a1
content-type: text/plain

This is content of the block B.

end->B
`;

        const mapper = new SdcDocumentMapper();
        const doc = mapper.readFromString(sdcString);

        const blockB = doc.getBlockById("B");
        if (blockB === undefined) {
            fail("Block B not found");
        }

        const blockA = doc.getBlockParentOf(blockB);
        if (blockA === undefined) {
            throw new Error("Block A not found");
        }

        expect(blockA.getId()).toBe("A");
    });

    test("Mapper get data: get map of child", () => {
        const sdcString = `SDC/1.0
title: Title

block A
content-type: text/plain

This is content of the block A.

end->A

block B<-A
content-type: text/plain

This is content of the block B.

end->B

block C<-A
content-type: text/plain

This is content of the block C.

end->C

block D<-A
content-type: text/plain

This is content of the block D.

end->D
`;

        const mapper = new SdcDocumentMapper();
        const doc = mapper.readFromString(sdcString);

        const blockA = doc.getBlockById("A");
        if (blockA === undefined) {
            fail("Block A not found");
        }

        const child = doc.getBlockChildOf(blockA);

        expect(child.size).toBe(3);
    });

    test("Mapper get data: get block by metadata", () => {
        const sdcString = `SDC/1.0
title: Title

block A
key: from
content-type: text/plain

This is content of the block A.

end->A

block B<-A
key: to
content-type: text/plain

This is content of the block B.

end->B
`;

        const mapper = new SdcDocumentMapper();
        const doc = mapper.readFromString(sdcString);

        const blockFrom = doc.getBlockByMetadata("key", "from");
        const blockTo = doc.getBlockByMetadata("key", "to");

        expect(blockFrom.size).toBe(1);

        const block0 = blockFrom.entries().next();
        if (!block0.done) {
            const [key, value] = block0.value;
            expect(key).toBe("A");
            expect(value.getContentByClazz(ContentTextPlain)?.get()).toBe("This is content of the block A.");
        }

        const block1 = blockTo.entries().next();
        if (!block1.done) {
            const [key, value] = block1.value;
            expect(key).toBe("B");
            expect(value.getContentByClazz(ContentTextPlain)?.get()).toBe("This is content of the block B.");
        }
    });

    test("Mapper tools: block count", () => {
        const doc = new SdcDocument();

        const block0 = new SdcBlock("0");
        block0.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block0);

        const block1 = new SdcBlock("1");
        block1.setContent(new ContentTextMarkdown("This is description of the document and it can be long as you want it."));
        doc.addBlock(block1);

        expect(doc.getBlockCount()).toBe(2);
    });

    test("Mapper tools: get block by id never exist", () => {
        const doc = new SdcDocument();

        const block = new SdcBlock("123");
        block.setContent(new ContentTextPlain("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);

        const blockNeverExist = doc.getBlockById("never-exist");

        expect(blockNeverExist).toBeUndefined();
    });

    test("Mapper parseFromString: block without closing, with content length -> IOException", () => {
        const sdc = `SDC/1.0
title: Title

block d4783f64-6736-4999-9c66-1692a20936c1
content-type: text/plain
content-length: 705

Artificial Intelligence (AI) refers to the simulation of human intelligence in machines designed to think and act like humans. It encompasses a range of technologies, including machine learning, natural language processing, and robotics, enabling systems to learn from data, recognize patterns, and make decisions. AI has the potential to transform various sectors, from healthcare and finance to transportation and entertainment, by enhancing efficiency, improving accuracy, and enabling new capabilities. As AI continues to evolve, it raises important ethical considerations regarding privacy, bias, and the future of work, prompting ongoing discussions about its responsible development and deployment.

`;

        const mapper = new SdcDocumentMapper();

        expect(() => mapper.readFromString(sdc)).toThrow(expect.objectContaining({
            name: 'Error',
            message: expect.stringMatching(/^SDC container error: Unable to find content range/)
        }));
    });

    test("Mapper parseFromString: block without closing and content length -> IOException", () => {
        const sdc = `SDC/1.0
title: Title

block d4783f64-6736-4999-9c66-1692a20936c1
content-type: text/plain

Artificial Intelligence (AI) refers to the simulation of human intelligence in machines designed to think and act like humans. It encompasses a range of technologies, including machine learning, natural language processing, and robotics, enabling systems to learn from data, recognize patterns, and make decisions. AI has the potential to transform various sectors, from healthcare and finance to transportation and entertainment, by enhancing efficiency, improving accuracy, and enabling new capabilities. As AI continues to evolve, it raises important ethical considerations regarding privacy, bias, and the future of work, prompting ongoing discussions about its responsible development and deployment.

`;

        const mapper = new SdcDocumentMapper();

        expect(() => mapper.readFromString(sdc)).toThrow(expect.objectContaining({
            name: 'Error',
            message: expect.stringMatching(/^SDC container error: Unable to find content range/)
        }));
    });

    test("Mapper writeToString: without content-type and content length", () => {
        const doc = new SdcDocument();

        const block = new SdcBlock("123");
        block.setContent(new ContentTextPlain("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0

block 123
content-type: text/plain
content-length: 70

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("Mapper tools: get metadata with null key", () => {
        const doc = new SdcDocument();
        doc.setMetadata(null as any, null as any);
        const docNull = doc.getMetadataValue(null as any);

        const block = new SdcBlock("123");
        block.setMetadata(null as any, null as any);
        block.setContent(new ContentTextPlain("This is description of the document and it can be long as you want it."));
        const blockNull = block.getMetadataValue(null as any);
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0

block 123
content-type: text/plain
content-length: 70

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
        expect(docNull).toBe(undefined);
        expect(blockNull).toBe(undefined);
    });

    test("Mapper tools: put metadata with null value", () => {
        const doc = new SdcDocument();
        doc.setMetadata("test", null as any);

        const block = new SdcBlock("123");
        block.setMetadata("test", null as any);
        block.setContent(new ContentTextPlain("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0

block 123
content-type: text/plain
content-length: 70

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("Mapper tools: put metadata with null key", () => {
        const doc = new SdcDocument();
        doc.setMetadata(null as any, "test");

        const block = new SdcBlock("123");
        block.setMetadata(null as any, "test");
        block.setContent(new ContentTextPlain("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0

block 123
content-type: text/plain
content-length: 70

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("Mapper tools: remove metadata with null key", () => {
        const doc = new SdcDocument();
        doc.setMetadata(null as any, null as any);
        doc.removeBlock(null as any);

        const block = new SdcBlock("123");
        block.setMetadata(null as any, null as any);
        block.setContent(new ContentTextPlain("This is description of the document and it can be long as you want it."));
        block.removeMetadata(null as any);
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0

block 123
content-type: text/plain
content-length: 70

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("Mapper tools: get block with null id", () => {
        const doc = new SdcDocument();

        const block = new SdcBlock("123");
        block.setContent(new ContentTextPlain("This is description of the document and it can be long as you want it."));
        doc.addBlock(block);
        const blockNull = doc.getBlockById(null as any);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0

block 123
content-type: text/plain
content-length: 70

This is description of the document and it can be long as you want it.

end->123
`;

        expect(sdcString).toBe(expected);
        expect(blockNull).toBe(undefined);
    });

    test("Mapper tools: add and remove block with null", () => {
        const doc = new SdcDocument();

        const block = new SdcBlock("123");
        block.setContent(new ContentTextPlain("This is description of the document and it can be long as you want it."));
        doc.addBlock(null as any);
        doc.removeBlock(null as any);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0
`;

        expect(sdcString).toBe(expected);
    });

    test("Mapper tools: set content with null", () => {
        const doc = new SdcDocument();

        const block = new SdcBlock("123");
        block.setContent(null as any);
        doc.addBlock(block);

        const mapper = new SdcDocumentMapper();
        const sdcString = mapper.writeToString(doc);

        const expected = `SDC/1.0

block 123
`;

        expect(sdcString).toBe(expected);
    });

    test("Mapper writeToString: write nested sdc", () => {
        const docChild = new SdcDocument();
        docChild.setMetadata("key1", "value1");

        const block1 = new SdcBlock("value");
        block1.setMetadata("key2", "value2");
        block1.setContent(new ContentTextPlain("this is content string"));
        docChild.addBlock(block1);

        const docParent = new SdcDocument();

        const block2 = new SdcBlock("123");
        block2.setContent(new ContentApplicationSdc(docChild));
        docParent.addBlock(block2);

        const mapper = new SdcDocumentMapper();

        const sdcString = mapper.writeToString(docParent);

        const expected = `SDC/1.0

block 123
content-type: application/sdc
content-length: 127

SDC/1.0
key1: value1

block value
content-type: text/plain
content-length: 22
key2: value2

this is content string

end->value


end->123
`;

        expect(sdcString).toBe(expected);
    });

    test("Mapper parseFromString: read sdc and block as block string", () => {
        const sdcString = `SDC/1.0

block my-block
content-type: text/plain
content-length: 22

this is content string

end->my-block
`;

        const mapper = new SdcDocumentMapper();

        const sdc = mapper.readFromString(sdcString);

        const block = sdc.getBlockById("my-block");
        if (block === undefined) {
            fail("Block not found");
        }

        expect(block.getMetadataValue(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block.getMetadataValue(SdcBlockMetadataKey.CONTENT_LENGTH)).toBe("22");

        expect(block.getContentByClazz(ContentTextPlain)?.get()).toBe("this is content string");

        const blockContentObj = block.getContent();
        if (blockContentObj instanceof ContentTextPlain) {
            const contentStr = blockContentObj.get();
            expect(contentStr).toBe("this is content string");
        } else {
            fail("Block content is not ContentTextPlain");
        }

        const contentStr = block.getContentByClazz(ContentTextPlain)?.get();
        expect(contentStr).toBe("this is content string");

        const result = mapper.writeToString(sdc);
        expect(result).toBe(sdcString);
    });

    test("Mapper parseFromString: read nested sdc", () => {
        const sdcString = `SDC/1.0

block my-block
content-type: application/sdc
content-length: 127

SDC/1.0
key1: value1

block value
content-type: text/plain
content-length: 22
key2: value2

this is content string

end->value


end->my-block
`;

        const mapper = new SdcDocumentMapper();

        const doc = mapper.readFromString(sdcString);

        const block = doc.getBlockById("my-block");
        if (block === undefined) {
            fail("Block not found");
        }

        expect(block.getMetadataValue(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("application/sdc");
        expect(block.getMetadataValue(SdcBlockMetadataKey.CONTENT_LENGTH)).toBe("127");

        const sdc2String = `SDC/1.0
key1: value1

block value
content-type: text/plain
content-length: 22
key2: value2

this is content string

end->value
`;

        const contentSdc2 = block.getContentByClazz(ContentApplicationSdc)?.get();
        if (contentSdc2 == null) {
            fail("Block content is not ContentApplicationSdc");
        }
        const contentSdc2String = mapper.writeToString(contentSdc2);
        expect(contentSdc2String).toBe(sdc2String);

        // try to read direct as Generic SdcBlockContent
        const blockContentObj = block.getContent();
        if (blockContentObj instanceof ContentApplicationSdc) {
            const contentDoc = blockContentObj.get();
            if (contentDoc === undefined) {
                fail("Block content is not ContentApplicationSdc");
            }
            expect(contentDoc.getMetadataValue("key1")).toBe("value1");
        }

        // try to read as a known class
        const blockContentSdcDoc = block.getContentByClazz(ContentApplicationSdc)?.get();

        if (blockContentSdcDoc === undefined) {
            fail();
        }

        expect(blockContentSdcDoc.getMetadataValue("key1")).toBe("value1");

        const block1 = blockContentSdcDoc.getBlockById("value");
        if (block1 === undefined) {
            fail();
        }

        const block1Content = block1.getContentByClazz(ContentTextPlain)?.get();

        expect(block1.getMetadataValue(SdcBlockMetadataKey.CONTENT_TYPE)).toBe("text/plain");
        expect(block1.getMetadataValue(SdcBlockMetadataKey.CONTENT_LENGTH)).toBe("22");
        expect(block1Content).toBe("this is content string");

        const result = mapper.writeToString(doc);
        expect(result).toBe(sdcString);
    });

    test("Mapper parseFromString: read sdc with custom block implementation", () => {
        const sdcString = `SDC/1.0

block my-block
content-type: primitive/integer
content-length: 5

12345

end->my-block
`;

        const mapper = new SdcDocumentMapper();

        // register custom block
        mapper.addBlockType(ContentPrimitiveInteger);

        const doc = mapper.readFromString(sdcString);

        const block = doc.getBlockById("my-block");
        if (block === undefined) {
            fail("Block not found");
        }

        const blockContent = block.getContentByClazz(ContentPrimitiveInteger)?.get();

        expect(blockContent).toBe(12345);

        const result = mapper.writeToString(doc);
        expect(result).toBe(sdcString);
    });

    test("Mapper parseFromString: read sdc with block with content-type unknown and write sdc again to string", () => {
        const sdcString = `SDC/1.0

block my-block
content-type: group/unknown
content-length: 22

this is content string

end->my-block
`;

        const mapper = new SdcDocumentMapper();

        const doc = mapper.readFromString(sdcString);

        const result = mapper.writeToString(doc);
        expect(result).toBe(sdcString);
    });

    test("Mapper parseFromString: read sdc with block with content-type application/json", () => {
        const sdcString = `SDC/1.0

block author444
content-type: application/json
content-length: 61

{"role":"USER","name":null,"attributes":null,"metadata":null}

end->author444

block f89c5c865cbe4c97a81c690b2f075dfb
content-type: application/sdc
content-length: 714

SDC/1.0
message-id: 684c41ad-1068-4e51-930f-485768b464fd
created-date: 1763438843622
thread-id: 67abcd64-dc38-489b-9fdc-29d7b35f3ddd
branch-id: 0d21c018-e363-4fb8-9608-731729aac358
parent-message-id: 99e61334-7016-4b7b-b67a-21e5db616fc7

block author
content-type: application/json
content-length: 61

{"role":"USER","name":null,"attributes":null,"metadata":null}

end->author

block metadata
content-type: application/json
content-length: 4

null

end->metadata

block attributes
content-type: application/json
content-length: 4

null

end->attributes

block content
content-type: application/sdc
content-length: 81

SDC/1.0

block 123
content-type: text/markdown
content-length: 4

test

end->123


end->content


end->f89c5c865cbe4c97a81c690b2f075dfb

block 82a4b4c981e04bceaa7baa4965363445
content-type: application/sdc
content-length: 641

SDC/1.0
message-id: 1ca08e7a-dd31-4da6-a886-89fdbe488e7e
created-date: 1763438843847
thread-id: 67abcd64-dc38-489b-9fdc-29d7b35f3ddd
branch-id: 0d21c018-e363-4fb8-9608-731729aac358
parent-message-id: 684c41ad-1068-4e51-930f-485768b464fd

block author
content-type: application/json
content-length: 62

{"role":"AGENT","name":null,"attributes":null,"metadata":null}

end->author

block metadata
content-type: application/json
content-length: 4

null

end->metadata

block attributes
content-type: application/json
content-length: 4

null

end->attributes

block content
content-type: application/sdc
content-length: 8

SDC/1.0


end->content


end->82a4b4c981e04bceaa7baa4965363445
`;

        const mapper = new SdcDocumentMapper();
        // register custom block
        mapper.addBlockType(ContentApplicationJson);

        const doc = mapper.readFromString(sdcString);

        const block1 = doc.getBlockById("f89c5c865cbe4c97a81c690b2f075dfb");
        if (block1 === undefined) {
            fail();
        }

        const block1ContentSdc = block1.getContentByClazz(ContentApplicationSdc)?.get();
        if (block1ContentSdc === undefined) {
            fail();
        }

        const blockAuthor = block1ContentSdc.getBlockById("author");
        if (blockAuthor === undefined) {
            fail();
        }
        const blockAuthorContent = blockAuthor.getContent();
        if (blockAuthorContent instanceof ContentApplicationJson) {
            if ("{\"role\":\"USER\",\"name\":null,\"attributes\":null,\"metadata\":null}" != (JSON.stringify(blockAuthorContent.get()))) {
                fail();
            }
        } else {
            fail();
        }

        const result = mapper.writeToString(doc);
        expect(result).toBe(sdcString);
    });
});
