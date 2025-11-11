import "./jobs/adModerationJob";

import cookieParser from "cookie-parser";
import cors from "cors";
import type {
  ErrorRequestHandler,
  NextFunction,
  Request as ExRequest,
  Response as ExResponse,
} from "express";
import express, { urlencoded } from "express";
import * as fs from "fs/promises";
import * as yaml from "js-yaml";
import * as path from "path";
import swaggerUi from "swagger-ui-express";

import { RegisterRoutes } from "./routes";
import logger from "./utils/logger";

const app = express();

app.use(
  urlencoded({
    extended: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => callback(null, origin || "*"),
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control",
    ],
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  }),
);

// app.use(express.json());

// Root endpoint
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Adx402 API, by IO AtelierTech",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Route to serve the OpenAPI specification in YAML format.
 * This route is not part of the TSOA-generated documentation.
 */
app.get("/openapi.yaml", async (_req: ExRequest, res: ExResponse) => {
  try {
    const swaggerJsonPath = path.resolve(
      process.cwd(),
      "build",
      "swagger.json",
    );
    const jsonContent = await fs.readFile(swaggerJsonPath, "utf8");
    const swaggerObject = JSON.parse(jsonContent);
    const yamlContent = yaml.dump(swaggerObject);

    // Set the Content-Type header and send the response.
    res.setHeader("Content-Type", "text/yaml");
    res.status(200).send(yamlContent);
  } catch (error: any) {
    logger.error("Failed to generate OpenAPI YAML:", error);
    res.status(500).send("Error: Could not generate the API specification.");
  }
});

app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  try {
    const swaggerJsonPath = path.resolve(
      process.cwd(),
      "build",
      "swagger.json",
    );
    const jsonContent = await fs.readFile(swaggerJsonPath, "utf8");
    const swaggerDocument = JSON.parse(jsonContent);

    const swaggerOptions = {
      swaggerOptions: {
        requestInterceptor: (request: any) => {
          request.credentials = "include";
          return request;
        },
        persistAuthorization: true,
      },
    };

    res.send(
      swaggerUi.generateHTML(
        swaggerDocument, // Use the parsed object instead of dynamic import
        swaggerOptions,
      ),
    );
  } catch (error: any) {
    // Log the error and respond gracefully if the swagger file cannot be loaded
    logger.error(
      `❌ Unhandled error for /docs/ (Swagger file load): ${error.message}`,
    );
    res
      .status(500)
      .send("Error: Could not load the API specification for documentation.");
  }
});

RegisterRoutes(app);

app.use(function notFoundHandler(_req, res: ExResponse) {
  res.status(404).send({
    message: "Not Found",
  });
});

const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  _next: NextFunction, // ✅ Don't call next!
): void => {
  // Check if it's a validation error (has errors property)
  if (typeof err === "object" && err !== null && "errors" in err) {
    const validationError = err as {
      errors: { [key: string]: { message: string } };
    };
    logger.warn(
      `Caught Validation Error for ${req.path}:`,
      validationError.errors,
    );

    res.status(422).json({
      message: "Validation Failed",
      details: validationError.errors,
    });
    return; // ✅ stop here
  }

  if (err instanceof Error) {
    console.log(err); // keeps the full error in console

    // Log the full structure
    logger.error(
      `❌ Unhandled error for ${req.path}: ${JSON.stringify(err, null, 2)}`,
    );

    // Respond with a cleaner message to client
    res.status(err.hasOwnProperty("status") ? (err as any).status : 500).json({
      message: err.message || "An error has occured",
      fields: (err as any).fields || undefined,
    });
  } else {
    logger.error(`❌ Unknown error type for ${req.path}:`, err);
    res.status(500).json({
      message: "Unexpected error",
    });
  }
};

app.use(errorHandler);

export default app;
