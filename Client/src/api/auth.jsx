import axios from 'axios'
// const API = "http://localhost:5001/api";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const currentUser = async (token) => await axios.post(`${API}/current-user`, {}, {
    headers: {
        Authorization: `Bearer ${token}`
    }
})

// export const currentAdmin = async (token) => {
//     return await axios.post('http://localhost:5001/api/current-admin', {}, {
//         headers: {
//             Authorization: `Bearer ${token}`
//         }
//     })
// }
