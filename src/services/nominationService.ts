import axiosClient from "./axiosClient";

export const getNominationDetails = (nominationID: number,userId: number) => {
  return axiosClient.get(
    `/api/jurylevelnomination/${nominationID}/${userId}`
  );
};

export const saveManagerApproval = (payload:any) => {
  return axiosClient.post("/api/managerlevelnomination", payload);
};

export const updateManagerApproval = (nominationId:number, payload:any) => {
  return axiosClient.put(`/api/managerlevelnomination/${nominationId}`, payload);
};

export const saveBusinessJuryApproval = (payload: any,evalutionType: number) => {
  return axiosClient.post( "/api/businessjurylevelnomination", payload,
    { params: { EvalutionType: evalutionType } }
  );
};

export const updateBusinessJuryApproval = (nominationId: number,payload: any,evalutionType: number) => {
  return axiosClient.put(`/api/businessjurylevelnomination/${nominationId}`, payload,
    { params: { EvalutionType: evalutionType } }
  );
};

export const saveGrandJuryApproval = (payload:any) => {
  return axiosClient.post("/api/grandjurylevelnomination", payload);
};

export const updateGrandJuryApproval = (nominationId:number, payload:any) => {
  return axiosClient.put(`/api/grandjurylevelnomination/${nominationId}`, payload);
};

export const saveReferralApproval = (payload:any) => {
  return axiosClient.post("/api/referrallevel", payload);
};

export const updateReferralApproval = (referralID:number, payload:any) => {
  return axiosClient.put(`/api/referrallevel/${referralID}`, payload);
};

export const uploadFiles = (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return axiosClient.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const downloadFile = (fileNameGUID: string) => {
  return axiosClient.get("/api/download", {
    params: { fileName: fileNameGUID },
    responseType: "blob",
  });
};