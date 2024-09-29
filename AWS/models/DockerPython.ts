import { execSync } from 'child_process';

export class DockerPython {
  public async crearLibPython(capa: string, vPython: string, pathOutputZip: string, archivoZip: string) {

    try {
      const dockerImageName = `python-build-${capa}`;
      execSync(`
        docker build -q -t ${dockerImageName} --build-arg capa=${capa} --build-arg vPython=${vPython} --build-arg nArchivo=${archivoZip} -f dockerfiles/Dockerfile.python .
      `);
      execSync(`
        docker run --rm -v ${pathOutputZip}:/output ${dockerImageName} bash -c "cp /app/${archivoZip}.zip /output/"
      `);
      execSync(`docker rmi ${dockerImageName}`);

    } catch (error) {
      if (error instanceof Error) {
        console.error("Error ejecutando Docker para Python:", error.message);
        throw new Error("Error ejecutando Docker para Python: " + error.message);
      } else {
        throw new Error("Error desconocido durante la construccion del layer.");
      }
    }
  }
}
