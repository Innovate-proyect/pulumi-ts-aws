import * as fs from 'fs';
import path from 'path';

export class DockerLayer {
  public archivosTempPython(
    requirements: string[],
    pythonVersion: string,
    nArchivo: string,
    outputDir: string
  ): { dockerfilePath: string, workDir: string } {

    const workDir = path.join(outputDir, `.tmp-${Date.now()}`);
    fs.mkdirSync(workDir, { recursive: true });
    const dockerfilePath = path.join(workDir, 'Dockerfile');
    const requirementsPath = path.join(workDir, 'requirements.txt');

    const dockerfileContent = `
FROM --platform=linux/amd64 python:${pythonVersion}

WORKDIR /app

RUN apt-get update && apt-get install -y \
  python3-venv \
  zip

RUN python${pythonVersion} -m venv create_layer

RUN /bin/bash -c "source create_layer/bin/activate && pip install --upgrade pip"

COPY requirements.txt .

RUN /bin/bash -c "source create_layer/bin/activate && pip install -r requirements.txt"

RUN mkdir -p python && \
    cp -r create_layer/lib python/ && \
    zip -r ${nArchivo}.zip python/

CMD ["echo", "Layer created and packaged!"]
`;
    fs.writeFileSync(dockerfilePath, dockerfileContent);
    fs.writeFileSync(requirementsPath, requirements.join('\n'));
    return { dockerfilePath, workDir };
  }
}
