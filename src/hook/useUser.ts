
import { QueryObserver, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createUser, deleteUser, editUser, getUsers } from '../api/user';
import { User } from '../interface';

const key: string = 'users'

export const useEditUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: editUser,
        onSuccess: (user_updated: User) => {
            // queryClient.invalidateQueries({
            //     queryKey: [key]
            // });

            queryClient.setQueryData([key],
                (prevUsers: User[] | undefined) => {
                    if (prevUsers) {
                        return prevUsers.map(user => {
                            // INFO: This code (Original from the article) uses mutation!
                            // altough returning a fresh object and a fresh array from 'map'
                            // the UI won't get updated! We cannot change old data even for the 
                            // favor to return fresh data!

                            // if (user.id === user_updated.id) {
                            //     user.name = user_updated.name
                            // }
                            
                            // return {...user};

                            if (user.id === user_updated.id) {
                                return { 
                                    id: user.id,
                                    name: user_updated.name
                                };
                            }

                            return user;
                        });
                    }
                    return prevUsers
                }
            )
        }
    })
}

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: (user: User) => {
            queryClient.setQueryData([key],
                (prevUsers: User[] | undefined) => prevUsers ? [user, ...prevUsers] : [user]
            );
        }
    })
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: (id) => {
            queryClient.setQueryData([key],
                (prevUsers: User[] | undefined) => prevUsers ? prevUsers.filter(user => user.id !== id) : prevUsers
            );
        }
    });
}

export const useGetUsers = () => {
    return useQuery({
        queryKey: [key],
        queryFn: getUsers,
    });
}

// INFO: We don't need the observer like the writer said.
// If we don't mutate old data in 'setQueryData' the ViewUser component
// will get updated!
export const useGetUsersObserver = () => {

    const get_users = useGetUsers()

    const queryClient = useQueryClient()

    const [users, setUsers] = useState<User[]>(() => {
        // get data from cache
        const data = queryClient.getQueryData<User[]>([key])
        return data ?? []
    })

    useEffect(() => {
        const observer = new QueryObserver<User[]>(queryClient, { queryKey: [key] })

        const unsubscribe = observer.subscribe(result => {
            if (result.data) setUsers(result.data)
        })

        return () => { unsubscribe() }
    }, [])

    return {
        ...get_users,
        data: users,
    }
}