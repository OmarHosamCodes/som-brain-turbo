import { protectedProcedure, publicProcedure, router } from "../index";
import { clientsRouter } from "./clients";
import { projectsRouter } from "./projects";
import { sprintsRouter } from "./sprints";
import { tasksRouter } from "./tasks";
import { timeTrackerRouter } from "./time-tracker";
import { workspaceRouter } from "./workspace";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	clients: clientsRouter,
	projects: projectsRouter,
	tasks: tasksRouter,
	sprints: sprintsRouter,
	timeTracker: timeTrackerRouter,
	workspace: workspaceRouter,
});
export type AppRouter = typeof appRouter;
