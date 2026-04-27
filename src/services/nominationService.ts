import axiosClient from "./axiosClient";

export const getNominationDetails = (nominationID: number,userId: number) => {
  return axiosClient.get(
    `/api/jurylevelnomination/${nominationID}/${userId}`
  );
};

export const getNomination = (nominationID: number) => {
  return axiosClient.get( `/api/nominations/${nominationID}`);
};

export const getNominationsByUser = ( userID: number,nominatedBy: number = 0) => {
  return axiosClient.get("/api/nominationsbyuser", {
    params: {
      userID: userID,
      NominatedBy: nominatedBy,
    },
  });
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

export const getUserById = (userId: number) => {
  return axiosClient.get("/api/users", { params: { userId },});
};

export const searchUsers = (searchText: string) => {
  return axiosClient.get("/api/users", {
    params: { searchText },
  });
};

export const getAwardCategories = () => {
  return axiosClient.get("/api/awardCategory");
};

export const getUsersByName = (pageNumber: number = 1, pageSize: number = 100) => {
  return axiosClient.get("/api/usersbyname", {
    params: {
      pageNumber,
      pageSize,
    },
  });
};

export const saveNomination = (payload:any) => {
  return axiosClient.post("/api/nomination", payload);
};

export const updateNomination = (nominationId: number,payload: any) => {
  return axiosClient.put(`/api/nominations/${nominationId}`, payload);
};

export const getNominationAuditLogs = (nominationId: number,pageNo: number = 1,recordCount: number = 100) => {
  return axiosClient.get("/api/logs/auditlog", {
    params: {
      pPageNo: pageNo,
      pRecordCount: recordCount,
      nominationId,
    },
  });
};

export const deleteNomination = ( nominationId: number,payload?: any) => {
  return axiosClient.delete(`/api/nominations/${nominationId}`, {
    data: payload,
  });
};

export const getReferralEvaluations = (userId: number) => {
  return axiosClient.get(`/api/referralvaluations/${userId}`);
};

export const getManagerEvaluations = (managerId: number) => {
  return axiosClient.get("/api/managerevaluation", {
    params: {ManagerID: managerId,},
  });
};

export const getBusinessJuryEvaluations = (userId: number) => {
  return axiosClient.get(`/api/businessjuryevaluation/${userId}`);
};

export const getPresidentEvaluations = () => {
  return axiosClient.get("/api/presidentevaluation");
};