import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getCookie } from "@curriculum-services/auth";
import type { Student } from "@/lib/hooks/useStudents";

interface AnsweredTraineesResponse {
  surveyId: string;
  code: string;
  trainees: Array<Pick<Student, 'id' | 'firstName' | 'middleName' | 'lastName' | 'email' | 'contactPhone'>>;
  count: number;
  message: string;
}

export function useAnsweredTrainees(surveyId?: string) {
  return useQuery({
    queryKey: ['survey', 'answered-trainees', surveyId],
    enabled: Boolean(surveyId),
    queryFn: async () => {
      const token = getCookie('token')
      const url = `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}/answered-trainees`
      const res = await axios.get<AnsweredTraineesResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.data
    }
  })
}


