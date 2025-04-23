import React, { useState } from "react";
import {
  authApi,
  userApi,
  taskApi,
  leaderboardApi,
  badgeApi,
} from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { mockTelegramLogin } from "@/utils/telegramMock";

const ApiTest = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleTest = async (testFn: () => Promise<any>, testName: string) => {
    try {
      setLoading(true);
      const data = await testFn();
      setResults({ data, testName });
      toast({ title: "Success", description: `${testName} succeeded` });
    } catch (error: any) {
      console.error(`${testName} failed:`, error);
      setResults({ error: error.response?.data || error.message, testName });
      toast({
        title: "Error",
        description: `${testName} failed: ${
          error.response?.data?.message || error.message
        }`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto py-8 container">
      <h1 className="mb-6 font-bold text-3xl">API Testing Dashboard</h1>

      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Test login/logout flows</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              onClick={async () => {
                const mockUser = await mockTelegramLogin();
                handleTest(
                  () =>
                    authApi.telegramLogin({
                      id: parseInt(mockUser.id),
                      username: mockUser.username,
                      photo_url: mockUser.avatarUrl,
                    }),
                  "Telegram Login"
                );
              }}
              variant="default"
              disabled={loading}
            >
              Test Login
            </Button>
            <Button
              onClick={() => handleTest(userApi.getProfile, "Get Profile")}
              variant="outline"
              disabled={loading}
            >
              Test Get Profile
            </Button>
            <Button
              onClick={() => handleTest(authApi.logout, "Logout")}
              variant="destructive"
              disabled={loading}
            >
              Test Logout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Test task management</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              onClick={() => handleTest(taskApi.getTasks, "Get All Tasks")}
              variant="default"
              disabled={loading}
            >
              Get All Tasks
            </Button>
            <Button
              onClick={() =>
                handleTest(
                  () =>
                    taskApi.createTask({
                      title: "Test Task " + new Date().toLocaleTimeString(),
                      description:
                        "This is a test task created from API test page",
                    }),
                  "Create Task"
                )
              }
              variant="outline"
              disabled={loading}
            >
              Create Task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gamification</CardTitle>
            <CardDescription>Test gamification features</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              onClick={() =>
                handleTest(leaderboardApi.getLeaderboard, "Get Leaderboard")
              }
              variant="default"
              disabled={loading}
            >
              Get Leaderboard
            </Button>
            <Button
              onClick={() =>
                handleTest(badgeApi.getAllBadges, "Get All Badges")
              }
              variant="outline"
              disabled={loading}
            >
              Get Badges
            </Button>
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Results: {results.testName}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md max-h-96 overflow-auto">
              {JSON.stringify(results.data || results.error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiTest;
