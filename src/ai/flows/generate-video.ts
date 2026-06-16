"use server";
/**
 * @fileOverview Handles video generation tasks using the Agnes-Video-V2.0 API.
 *
 * - createVideoTask - Submits a video generation task.
 * - getVideoTaskStatus - Polls the status of a video generation task.
 */

import { AGNES_API_KEY, AGNES_BASE_URL } from "@/constants";

export interface CreateVideoTaskInput {
  prompt: string;
  imageUrl?: string;
  width?: number;
  height?: number;
  num_frames?: number;
  frame_rate?: number;
}

export interface CreateVideoTaskOutput {
  taskId: string;
  videoId: string;
  status: string;
  progress: number;
  seconds?: string;
  size?: string;
}

export interface VideoTaskStatusOutput {
  taskId: string;
  videoId: string;
  status: string;
  progress: number;
  videoUrl?: string;
  error?: string | null;
}

/**
 * Submits a video generation task to Agnes AI.
 */
export async function createVideoTask(
  input: CreateVideoTaskInput
): Promise<CreateVideoTaskOutput> {
  try {
    const url = `${AGNES_BASE_URL}/videos`;
    const headers = {
      "Authorization": `Bearer ${AGNES_API_KEY}`,
      "Content-Type": "application/json",
    };

    const payload: any = {
      model: "agnes-video-v2.0",
      prompt: input.prompt,
      width: input.width || 1152,
      height: input.height || 768,
      num_frames: input.num_frames || 121,
      frame_rate: input.frame_rate || 24,
    };

    // If an image is provided, we use it for image-to-video (ti2vid)
    if (input.imageUrl) {
      payload.image = input.imageUrl;
    }

    console.log("Submitting video task to Agnes AI:", url, JSON.stringify(payload));

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agnes AI video task creation failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      throw new Error(`Failed to create video task: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Agnes AI video task created successfully:", data);

    return {
      taskId: data.task_id || data.id,
      videoId: data.video_id,
      status: data.status,
      progress: data.progress || 0,
      seconds: data.seconds,
      size: data.size,
    };
  } catch (error) {
    console.error("Error in createVideoTask:", error);
    throw error;
  }
}

/**
 * Queries the status of a video generation task using video_id.
 */
export async function getVideoTaskStatus(
  videoId: string
): Promise<VideoTaskStatusOutput> {
  try {
    // The query endpoint is https://apihub.agnes-ai.com/agnesapi?video_id=<VIDEO_ID>
    // Note that the base URL for this endpoint is the domain root, not /v1
    const baseUrlRoot = AGNES_BASE_URL.replace("/v1", "");
    const url = `${baseUrlRoot}/agnesapi?video_id=${videoId}`;
    const headers = {
      "Authorization": `Bearer ${AGNES_API_KEY}`,
    };

    console.log(`Polling Agnes AI video task status for video_id: ${videoId}`);

    const response = await fetch(url, {
      method: "GET",
      headers,
      // Avoid caching of polling requests
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Agnes AI video status poll failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      throw new Error(`Failed to query video status: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Agnes AI video status response for ${videoId}:`, data);

    return {
      taskId: data.id || data.task_id,
      videoId: data.video_id || videoId,
      status: data.status,
      progress: data.progress || 0,
      videoUrl: data.remixed_from_video_id || undefined, // Video URL is in remixed_from_video_id
      error: data.error,
    };
  } catch (error) {
    console.error(`Error in getVideoTaskStatus for ${videoId}:`, error);
    throw error;
  }
}
