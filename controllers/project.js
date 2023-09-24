"use strict";

const { status } = require("express/lib/response");
const project = require("../models/project");
var Project = require("../models/project");
var fs =require('fs');
var path = require('path');


var controller = {
  home: function (req, res) {
    // Agregamos 'req' y 'res' como parámetros
    return res.status(200).send({
      message: "soy la home",
    });
  },
  test: function (req, res) {
    // Agregamos 'req' y 'res' como parámetros
    return res.status(200).send({
      message: "soy el metodo o accion test del controlador de project",
    });
  },
  saveProject: function (req, res) {
    var project = new Project();

    var params = req.body;
    project.name = params.name;
    project.description = params.description;
    project.category = params.category;
    project.year = params.year;
    project.langs = params.langs;
    project.image = null;

    project
      .save()
      .then((projectStored) => {
        if (!projectStored) {
          return res
            .status(404)
            .send({ message: "No se ha podido guardar el proyecto" });
        }

        // Solo envía la respuesta HTTP 200 después de que se guarde el proyecto correctamente
        return res.status(200).send({
          project: projectStored,
          message: "Proyecto guardado correctamente",
        });
      })

      .catch((err) => {
        return res
          .status(500)
          .send({ message: "Error al guardar el documento", error: err });
      });
  },

  getProject: function (req, res) {
    var projectId = req.params.id;

    if (!projectId) {
      return res.status(404).send({ message: "El proyecto no existe" });
    }

    Project.findById(projectId)
      .then((project) => {
        if (!project) {
          return res.status(404).send({ message: "El proyecto no existe" });
        }
        return res.status(200).send({ project });
      })
      .catch((err) => {
        return res.status(500).send({ message: "Error al devolver los datos" });
      });
  },

  getProjects: function (req, res) {
    // Buscar todos los proyectos en la base de datos
    Project.find({})
      .sort({ year: 1 })
      .exec()
      .then((projects) => {
        // Verificar si no se encontraron proyectos
        if (!projects || projects.length === 0) {
          return res
            .status(400)
            .send({ message: "No hay proyectos para mostrar" });
        }

        // Enviar los proyectos encontrados como respuesta
        return res.status(200).send({ projects });
      })
      .catch((err) => {
        // Manejar errores
        return res.status(500).send({ message: "Error al devolver los datos" });
      });
  },

  updateProject: function (req, res) {
    var projectId = req.params.id;
    var update = req.body;

    // Utiliza findByIdAndUpdate para actualizar el proyecto por su ID y devuelve una promesa
    Project.findByIdAndUpdate(projectId, update, { new: true })
      .then((projectUpdated) => {
        if (!projectUpdated)
          return res
            .status(404)
            .send({ message: "No existe el proyecto a actualizar" });

        return res.status(200).send({
          project: projectUpdated,
        });
      })
      .catch((err) => {
        return res.status(500).send({ message: "Error al actualizar" });
      });
  },

  // deleteProject: function (req, res) {
  //     var projectId = req.params.id;

  //     project.findByIdAndRemove(projectId, (err, projectRemoved) => {
  //         if (err) return res.status(500).send({ message: 'No se ha podido borrar el proyecto' });
  //         if (!projectRemoved) return res.status(404).send({ message: 'No se puede borrar este proyecto' });

  //         return res.status(200).send({
  //             project: projectRemoved
  //         });
  //     });
  // }
  async deleteProject(req, res) {
    try {
      const projectId = req.params.id;
      const projectRemoved = await project.findByIdAndDelete(projectId);

      if (!projectRemoved) {
        return res
          .status(404)
          .send({ message: "No se puede borrar este proyecto" });
      }

      return res.status(200).send({
        project: projectRemoved,
      });
    } catch (err) {
      return res
        .status(500)
        .send({ message: "No se ha podido borrar el proyecto" });
    }
  },
  uploadImage: async function (req, res) {
    const projectId = req.params.id;
    let fileName = "Imagen no subida...";
    // if (req.files) {
    //   const filePath = req.files.image.path;
    if (req.files && req.files.image) {
      const filePath = req.files.image.path;
      const fileSplit = filePath.split("\\");
      fileName = fileSplit[1];
      var extSplit=fileName.split('\.');
      var fileExt=extSplit[1];

      if(fileExt=='png'|| fileExt =='jpg' || fileExt=='jpeg' || fileExt== 'gif'){

          
          try {
              const projectUpdated = await Project.findByIdAndUpdate(
                  projectId,
                  { image: fileName },
                  { new: true }
                  );
                  
                  if (!projectUpdated) {
                      return res.status(404).send({
                          message: "El proyecto no existe",
                        });
                    }
                    
                    return res.status(200).send({
          project: projectUpdated,
        });
    } catch (err) {
        return res.status(500).send({
            message: "Hubo un error al actualizar la imagen",
        });
    }
    }else{
        fs.unlink(filePath,(err)=>{
            return res.status(200).send({message:'La extension no es valida'});
        });

    }
}
 else {
    return res.status(200).send({
        message: fileName,
    });
}
},

getImageFile: function(req,res){
  var file = req.params.image;
  var path_file ='./uploads/'+file;

  fs.exists(path_file,(exists )=>{
    if(exists){
      return res.sendFile(path.resolve(path_file));
    }else{
      return res.status(200).send({
        message:'No existe la imagen...'
      })
    }

  });


}
};

module.exports = controller;
