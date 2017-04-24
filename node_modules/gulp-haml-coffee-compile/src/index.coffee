map = require("map-stream")
rext = require("replace-ext")
hamlc = require("haml-coffee")
gutil = require("gulp-util")
_ = require("underscore")
path = require("path")
module.exports = (options) ->
  options = {}  unless options?
  defaultOpts =
    name: ""
    compile:
      includePath: true
      pathRelativeTo: "./"

  options = _.extend(defaultOpts, options)
  compileOpts = options.compile

  delete options.compile


  hamlStream = (file, cb) ->
    return cb(null, file)  if file.isNull() # pass along
    return cb(new Error("gulp-haml-coffee: Streaming not supported"))  if file.isStream()

    filePath = path.relative(compileOpts.pathRelativeTo, file.path)

    if compileOpts.includePath
      temp = filePath.split('/')
      temp.pop()
      options.name =  temp.join("/") + "/";

    options.name += filePath.split('/').pop().split('.')[0]

    output = undefined

    try
      output = hamlc.template(file.contents.toString(), options.name, options.namespace)
      file.path = rext(file.path, ".js")
    catch e
      throw new gutil.PluginError("gulp-haml-coffee", "Error compiling " + file.path + ": " + e,
        showStack: true
      )
    file.contents = new Buffer(output.toString("utf8"))
    cb null, file
    return

  map hamlStream
