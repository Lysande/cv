var Strings = (function () {

  // Just a map w/ strings
  var resources =
  {
      "personal_details": "Vem jag är",
      "education": "Utbildning",
      "work_experience": "Arbete",
      "skills": "Färdigheter"
  }
  var getResource = function (key)
  {
    // Return resource OR if resource doesn't exist, return key.
    var str;
    return typeof (str = resources[key]) !== "undefined" ? str : key
  }

  return {
    getResource: getResource,
    resources: resources
  }
})()



var parseCV = (function () {

  var api = {}

  api.hasCV = function () { return typeof api.cv === "object" }

  api.open = function (cv)
  {
    api.cv = cv
    return this
  }

  api.getSections = function ()
  {
    return Object.keys(api.cv);
  }

  return {
    open: api.open,
    getSections: api.getSections,
    getSectionByName: function (sectionName)
    {
      return api.cv[sectionName]
    }
  }
})()


var applicationOptions =
{
  dependencies:
  {
      templateEngine: Handlebars,
      ajaxEngine:
      {
        get: pegasus
      },
      parser: parseCV
  },
  settings:
  {
    template:
    {
      rootDir: "../cv/templates/",
      fileExt: ".hbs"
    },
    data:
    {
      file: "../cv/data/cv.json"
    }
  }
}

var App = (function (opts)
{
  var api = {}

  var settings = opts.settings
  var ajaxEngine = opts.dependencies.ajaxEngine
  var templateEngine = opts.dependencies.templateEngine
  var parser = opts.dependencies.parser

  api.renderSection = function (section, template, data)
  {
    data.title = Strings.getResource(section)

    // PReferrably extract to method
    if (section == "work_experience")
    {
      var months = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli",
                    "Augusti", "September", "Oktober", "November", "December"]

      var items = data.filter(function (e) {
        return typeof e === "object";
      })
      .forEach(function (e, index) {
        // var from = months[e.from.month] + " " + e.from.year
        // var to = months[e.to.month] + " " + e.to.year
        var from = e.from.year;
        var to = e.to.year || "-";
        data[index].from = from
        data[index].to = to

      })
    }


    var id = "#" + section
    var view = templateEngine.compile(template)(data)
    var element = document.querySelector(id)


    if (element !== null)
    {
      element.innerHTML = view
    }
  }

  api.loadSectionTemplates = function (cv)
  {
    parser.open(cv)
    .getSections()
    .forEach(function (sectionName) {

      var file = settings.template.rootDir + sectionName + settings.template.fileExt
      var callback = function (data, xhr) {
        api.renderSection(sectionName, xhr.response, parseCV.getSectionByName(sectionName))
      }

      ajaxEngine.get(file).then(callback)
    })

  }

  api.init = function ()
  {
    ajaxEngine
    .get(settings.data.file)
    .then(api.loadSectionTemplates)
  }

  return {
    init: api.init()
  }
})(applicationOptions)
