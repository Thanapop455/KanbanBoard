import React, { useState, useEffect } from 'react'
import useKanbanStore from '../store/kanbanStore'
import { currentAdmin } from '../api/auth'
import LoadingToRedirect from './LoadingToRedirect'


const ProtectRouteAdmin = ({ element }) => {
    const [ok, setOk] = useState(false)
    const user = useKanbanStore((state) => state.user)
    const token = useKanbanStore((state) => state.token)

    useEffect(() => {
        if (user && token) {
            currentAdmin(token)
                .then((res) => setOk(true))
                .catch((err) => setOk(false))
        }
    }, [])

    return ok ? element : <LoadingToRedirect />
}

export default ProtectRouteAdmin