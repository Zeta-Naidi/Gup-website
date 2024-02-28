import axios from "axios";

class ApiService {
  #instanceAxiosBackend;
  constructor() {
    this.#instanceAxiosBackend = axios.create({
      withCredentials: true,
      withXSRFToken: true,
      baseURL: import.meta.env.VITE_APP_BASEURL
    })
  }
  axiosToBackend(){
    return this.#instanceAxiosBackend;
  }

} export default new ApiService()
