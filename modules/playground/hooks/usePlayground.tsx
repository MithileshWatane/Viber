/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import type { TemplateFolder } from "../lib/path-to-json";
import { getPlaygroundById, SaveUpdatedCode } from "../actions";

interface PlaygroundData {
  id: string;
  title?: string;
  [key: string]: any;
}

interface UsePlaygroundReturn {
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayground: () => Promise<void>;
 saveTemplateData: (data: TemplateFolder) => Promise<any>;
}

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(
    null
  );
  const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlayground = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await getPlaygroundById(id);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //   @ts-expect-error
      setPlaygroundData(data);
      const rawContent = data?.templateFiles?.[0]?.content;

      if (typeof rawContent === "string") {
        const parsedContent = JSON.parse(rawContent);
        setTemplateData(parsedContent);
        toast.success("playground loaded successfully");
        return;
      }

      //   load template from api if not in saved content

      const res = await fetch(`/api/template/${id}`);

      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);

      const templateRes = await res.json();

      if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
        setTemplateData({
          folderName: "Root",
          items: templateRes.templateJson,
        });
      } else {
        setTemplateData(
          templateRes.templateJson || {
            folderName: "Root",
            items: [],
          }
        );
      }
      toast.success("Template loaded successfully");
    } catch (error) {
      console.error("Error loading playground:", error);
      setError("Failed to load playground data");
      toast.error("Failed to load playground data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);



const saveTemplateData = useCallback(async (data: TemplateFolder) => {
  try {
    const updatedTemplate: any = await SaveUpdatedCode(id, data);

    let templateToSet: TemplateFolder = { folderName: "Root", items: [] };

    if (updatedTemplate && typeof updatedTemplate === "object") {
      if ("folderName" in updatedTemplate && Array.isArray(updatedTemplate.items)) {
        templateToSet = { folderName: updatedTemplate.folderName, items: updatedTemplate.items };
      } else if ("content" in updatedTemplate) {
        let parsed = updatedTemplate.content;

        if (typeof parsed === "string") {
          try { parsed = JSON.parse(parsed); } catch {}
        }

        if (Array.isArray(parsed)) {
          templateToSet = { folderName: "Root", items: parsed };
        } else if (parsed?.items && Array.isArray(parsed.items)) {
          templateToSet = { folderName: parsed.folderName || "Root", items: parsed.items };
        }
      }
    }

    setTemplateData(templateToSet);
    toast.success("Changes saved successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to save changes");
    throw error;
  }
}, [id]);


  useEffect(()=>{
    loadPlayground()
  },[loadPlayground])

    return {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayground,
    saveTemplateData,
  };
};
