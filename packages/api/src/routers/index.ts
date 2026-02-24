import { protectedProcedure, publicProcedure, router } from "../index";
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
	timeTracker: timeTrackerRouter,
	workspace: workspaceRouter,
});
export type AppRouter = typeof appRouter;
