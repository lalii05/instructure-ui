/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import path from 'path'
import { parse, builtinResolvers, makeFsImporter, Documentation } from 'react-docgen'

const ERROR_MISSING_DEFINITION = 'No suitable component definition found.'

export function getReactDoc(
  source: Buffer,
  fileName: string,
  error: (err: Error) => void
) {
  let doc: Documentation | undefined = undefined
  try {
    let parsed = parse(
      source,
      {
        resolver: new builtinResolvers.FindExportedDefinitionsResolver(),
        filename: fileName,
        importer: makeFsImporter()
      }
    )
    if (parsed.length > 1) {
      // If a file has multiple exports this will choose the one that has the
      // same name in its path.
      for (const docExport of parsed) {
        const filePathArray = fileName.split(path.sep)
        if (docExport.displayName && filePathArray.includes(docExport.displayName)) {
          doc = docExport
          break
        }
      }
    } else {
      doc = parsed.pop()
    }
  } catch (err: any) {
    if (err.message !== ERROR_MISSING_DEFINITION) {
      error(err)
    }
  }
  return doc
}
