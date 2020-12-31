# FEM.js

Model Civil Engineering Structures with [FEM.js](https://rvcristiand.github.io/FEM.js).

## Getting Started

You can use [FEM.js](https://rvcristiand.github.io/FEM.js) online! Just click [here](https://rvcristiand.github.io/FEM.js/).

Alternatively, you can run it from a local machine. The following instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need a Web Browser and run a local server. [Git](https://git-scm.com/) is optional.

#### Get a copy of FEM.js

Fork, clone or download this repository.

#### Web Browser

Use the browser you want. We recommend _Firefox_ or _Google Chrome_.

#### Local server

You can run a local server with using _python_. If you have _python 2_, you can run the command

```
python -m SimpleHTTPServer
```

in the folder root.

If you have _python 3_, run the command

```
python3 -m http.server
```

#### Installing

If you have already a local host running on your machine, you can open the _index.html_ file to test the program.

## API

Details about the functions provides by FEM.js.

### Functions


- Load a model.

  `open("filename.json")`

  - filename.json: input file.

- Add a joint to the model at position (_x_, _y_, _z_).

  `addJoint(x, y, z)`

  - _x_: coordinate x.
  - _y_: coordinate y.
  - _z_: coordinate z.

- Add a frame to the model with _j_ as the near joint and _k_ as the far joint.

  `addFrame(name, j, k)`

  - name: name of the frame.
  - _j_: near joint.
  - _k_: far joint.

- Add many joints to the model at random positions inside a sphere.

  `manyJoints(radius, number)`

  - radius: sphere's radius.
  - number: number of joints.

- Add many frames to the model at random positions inside a sphere.

  `manyFrames(radius, number)`

  - radius: sphere's radius.
  - number: number frames.

## Built with

* JavaScript
* CSS
* html
* [three.js](https://threejs.org/)

## Authors

* __Cristian Ramirez__ - [rvcristiand](https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0000122390)
