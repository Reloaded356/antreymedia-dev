gutil = require("gulp-util")
hamlc = require("../")
path = require("path")
fs = require("fs")
gulp = require("gulp")


describe 'gulp haml coffee compile', ()->
  it 'compile .haml file to JS', ()->
    hamlcStream = hamlc()
    hamlFile = "spec/src/test.haml"
    jsTest = 'spec/src/expected/test.js'

    testFile = new gutil.File
      path: hamlFile
      contents: fs.readFileSync(hamlFile)


    hamlcStream.once 'data', (newFile)=>
      expect(newFile.contents.toString('utf8')).toEqual(fs.readFileSync(jsTest, 'utf8'))

    hamlcStream.write(testFile)

  it 'compile subdir .haml file to JS', ()->
    hamlcStream = hamlc()
    hamlFile = "spec/src/subdir/test.haml"
    jsTest = 'spec/src/expected/subdir/test.js'

    testFile = new gutil.File
      path: hamlFile
      contents: fs.readFileSync(hamlFile)


    hamlcStream.once 'data', (newFile)=>
      expect(newFile.contents.toString('utf8')).toEqual(fs.readFileSync(jsTest, 'utf8'))

    hamlcStream.write(testFile)

  it 'compiled subdir file', ()->
    jsTest = 'spec/src/expected/subdir/test.js'
    window = {}
    eval(fs.readFileSync(jsTest, 'utf8'))
    spyOn(window.HAML, 'spec/src/subdir/test')
    expect(window.HAML["spec/src/subdir/test"]).toBeDefined()
    expect(typeof window.HAML["spec/src/subdir/test"]).toEqual('function')
    window.HAML["spec/src/subdir/test"]()
    expect(window.HAML["spec/src/subdir/test"]).toHaveBeenCalled()
