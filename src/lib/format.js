import { format } from "date-fns";
export const fmtDate = (iso) => format(new Date(iso), "dd MMM yyyy");
export const fmtDateTime = (iso) => format(new Date(iso), "dd MMM yyyy, HH:mm");
export const fmtMonth = (iso) => format(new Date(iso), "MMM yy");
