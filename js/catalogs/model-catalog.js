class ModelCatalog {

  constructor(expanded_jsonld) {
    this.ns = "https://w3id.org/mint/modelCatalog#";
    this.commons = "https://w3id.org/mint/commons#";
    this.ontns = "http://ontosoft.org/software#";

    this.models = [];

    this._parseJson(expanded_jsonld);
  }

  _getDataValue(item, property) {
    var values = this._getValues(item, property);
    if(values != null) {
      return values[0]["@value"];
    }
    return null;
  }

  _getValues(item, property) {
    return item [ property ] || null;
  }

  _getID(item) {
    return item["@id"];
  }

  _getTypes(item) {
    return this._getValues(item, "@type");
  }

  _parseJson(expanded_jsonld) {
    // Collect instances by type
    var terms = {};
    for(var i=0; i<expanded_jsonld.length; i++) {
      var item = expanded_jsonld[i];
      var types = this._getTypes(item)
      var id = this._getID(item);
      for(var j=0; j<types.length; j++) {
        var type = types[j];
        if(!terms[type]) {
          terms[type] = {};
        }
        terms[type][id] = item;
      }
    }
    // Instances of models, softwares, etc
    var models = terms [ this.ns + "Model" ];
    var softwares = terms [ this.ontns + "Software" ];
    var configs = terms [ this.ns + "ModelConfiguration" ];
    var specs = terms [ this.ns + "DatasetSpecification" ];
    var presentations = terms [ this.commons + "VariablePresentation" ];

    // Convert Models to internal version
    for(var model_id in models) {
      var model = models[model_id];
      var model_configs = this._getValues(model, this.ns + "hasConfiguration");
      for(var i=0; i<model_configs.length; i++) {
        var config_id = this._getID(model_configs[i]);
        var model_config = configs[config_id];
        var new_model = {
          id: getLocalName(config_id),
          name: getLocalName(model_id),
          type: "Model",
          category: this._getDataValue(model, this.ns + "hasModelCategory"),
          inputs: this._convertIO(this.ns + "hasInput", model_config, specs, presentations),
          outputs: this._convertIO(this.ns + "hasOutput", model_config, specs, presentations)
        };
        if(new_model.inputs && new_model.outputs)
          this.models.push(new_model);
      }
    }

    // Convert Softwares to internal version
    for(var software_id in softwares) {
      var software = softwares[software_id];
      var new_software = {
        id: getLocalName(software_id),
        name: getLocalName(software_id),
        type: "Software",
        inputs: this._convertIO(this.ontns + "hasInput", software, specs, presentations),
        outputs: this._convertIO(this.ontns + "hasOutput", software, specs, presentations)
      };
      if(new_software.inputs && new_software.outputs)
        this.models.push(new_software);
    }
  }

  _convertIO(io_property, item, specs, presentations) {
    var ios = this._getValues(item, io_property);
    if(!ios) {
      return null;
    }

    var new_ios = [];
    for (var i=0; i<ios.length; i++) {
      var id = this._getID(ios[i]);
      var new_io = {
        id: getLocalName(id)
      }
      new_ios.push(new_io);

      var io = specs [ id ];
      var pres_ids = this._getValues(io, this.commons + "hasPresentation");
      if(!pres_ids) {
        continue;
      }

      new_io["variables"] = [];

      for(var j=0; j<pres_ids.length; j++) {
        var pres_id = this._getID(pres_ids[j]);
        var presentation = presentations[pres_id];
        if(presentation) {
          var vid = getLocalName(pres_id);
          var vname = this._getDataValue(presentation, this.commons + "hasShortName") || vid;
          var desc = this._getDataValue(presentation, this.commons + "hasDescription");
          var sname = this._getDataValue(presentation, this.commons + "hasStandardVariable");
          var cname = this._getDataValue(presentation, this.commons + "hasCanonicalName") || null;
          var units = this._getDataValue(presentation, this.commons + "usesUnit") || null;
          var variable = {
            id: vid,
            name: vname,
            description: desc,
            standard_name: sname,
            canonical_name: cname
          }
          if(units) {
            variable["metadata"] = {
              units: units
            }
          }
          new_io["variables"].push(variable);
        }
      }
    }
    return new_ios;
  }
}
