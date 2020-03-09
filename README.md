# FEM.js
Model Civil Engineering Structures with [FEM.js](rvcristiand.github.com/FEM.js).

## Getting Started
You can use [FEM.js](rvcristiand.github.com/FEM.js) online !

Alternatively, you can run it in your local machine. These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
You need a Web Browser and run a locar server. [Git](https://git-scm.com/) is optional.

#### Get a copy of FEM.js
Clone with or download this repository.

#### Web Browser
Use the browser you want. I use _Google Chrome_.

#### Local server
You can run a local server with using _python_. If you have _python 2_, you can use
```
python -m SimpleHTTPServer
```
in the folder root.

If you have _python 3_, you can use
```
python3 -m http.server
```

#### Instalatling
If you have already a local host running, you can open the _index.html_ file to test the program.

## API

Details about the functions provides by FEM.js.

### Functions
---
#### addJoint(x, y, z)
Add a joint to the model at position (x, y, z).
- x: coordinate x.
- y: coordinate y.
- z: coordinate z.

#### manyJoints(radius, quantite)
Add many joints to the model at random positions inside a sphere.
- radius: sphere's radius.
- quantite: quantite joints.

## Built with
* [three.js](https://threejs.org/)

## Authors
* **Cristian Ramirez** - [rvcristiand](https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0000122390)
