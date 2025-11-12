import * as yup from "yup";
export const registerSchema = yup
  .object({
    username: yup
      .string()
      .required("Username is required")
      .min(5, "Username should be at least 5 charachters"),
    email: yup
      .string()
      .required("Email is required")
      .matches(/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, "Not a valid email address.") ,
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password should be at least 6 charachters."),
  })
  .required();
export const loginSchema = yup
  .object({
    identifier: yup
      .string()
      .required("Email is required")
      .matches(/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, "Not a valid email address."),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Password should be at least 6 charachters."),
      
  })
    // ✅ هي بتخليه فعلاً اختياري
  
  .required();
  export const AddtodoV=yup
  .object({
     title:yup
     .string()
     .required("title is required")
     .min(6,"the title must be least 6 charachters. "),

  description:yup
     .string()
     .required(" description is required")
     .min(50,"the  description must be least 50 charachters. "),
  })
  .required();
   export const EditTv=yup
  .object({
     title:yup
     .string()
     .required("title is required")
     .min(6,"the title must be least 6 charachters. "),

  description:yup
     .string()
     .required(" description is required")
     .min(50,"the  description must be least 50 charachters. "),
  })
  .required();

export const loginSchemaU = yup
  .object({
   username: yup
      .string()
      .required("Username is required")
      .min(6,"the username must be least 6 charachters. "),
   email: yup
      .string()
      .required("Email is required")
      .matches(/^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, "Not a valid email address.") ,
      
  })