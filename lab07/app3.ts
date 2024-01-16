// Original source: https://medium.com/recoding/rendering-html-css-in-deno-using-view-engine-e07469613598
// Modifications: Stanisław Polak <polak@agh.edu.pl>

// Requiring modules
import {
    Application,
    Router,
    // send
  } from "https://deno.land/x/oak/mod.ts";
  import {
    dejsEngine,
    oakAdapter,
    viewEngine,
  } from "https://deno.land/x/view_engine/mod.ts";
  import logger from "https://deno.land/x/oak_logger/mod.ts";
  
  // Initiate app
  const app: Application = new Application();
  const router: Router = new Router({
    // prefix: "/admin",
  });
  
  // Allowing Static file to fetch from server
  /*
  app.use(async (ctx, next) => {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/public`,
    });
    next();
  });
  */
  
  app.use(logger.logger);
  app.use(logger.responseTime);
  
  // Passing view-engine as middleware
  app.use(viewEngine(oakAdapter, dejsEngine, { viewRoot: "./views" }));
  
  // Creating Routes
  router.get("/", async (ctx) => {
    await ctx.render("index.ejs", {
      data: { title: "First Oak application in Deno" },
    });
  });
  
  router.post("/", async (ctx) => {
    if (ctx.request.hasBody) {
      const reqBodyValue = await ctx.request.body().value;
      // ctx.response.type = 'text/html'
      ctx.response.body = `Hello '${reqBodyValue.get("name")}'`;
    }
  });
  
  // Adding middleware to require our router
  app.use(router.routes());
  app.use(router.allowedMethods());
  
  // Making app to listen to port
  console.log("App is listening to port: 8000");
  await app.listen({ port: 8000 });