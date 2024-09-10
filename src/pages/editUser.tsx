import { useParams } from "react-router-dom";
import {
  useDeleteUser,
  useEditUser,
  useGetUsersObserver,
  useGetUsers,
} from "../hook/useUser";
import { User } from "../interface";

export const EditUser = () => {
  const params = useParams();

  const { id } = params;

  if (!id) return null;

  return (
    <>
      <ViewUser id={+id} />
      <EditUserForm id={+id} />
      <DeleteUser id={+id} />
    </>
  );
};

export const ViewUser = ({ id }: Pick<User, "id">) => {
  const { data } = useGetUsers();
  //const { data } = useGetUsersObserver();

  const user_selected = data?.find((user) => user.id === +id);

  if (!user_selected) return null;

  return (
    <>
      {new Date().toLocaleTimeString()}
      <h1>Edit user: {id}</h1>
      <span>
        User name: <b>{user_selected?.name}</b>
      </span>
    </>
  );
};

export const EditUserForm = ({ id }: Pick<User, "id">) => {
  
  const edit_user = useEditUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const datax = Object.fromEntries(new FormData(form));
    await edit_user.mutateAsync({ name: datax.user as string, id });
    form.reset();
  };

  return (
    <>
      <hr style={{ width: "500px" }} />
      <form onSubmit={handleSubmit}>
        <input name="user" type="text" placeholder="Update this user" />
        {edit_user.isPending && <span>updating user...</span>}
        <button>Update User</button>
        {edit_user.isSuccess && <span>User updated successfully ✅</span>}
        {edit_user.isError && <span>Ups! it was an error 🚨</span>}
      </form>
    </>
  );
};

export const DeleteUser = ({ id }: Pick<User, "id">) => {
  const delete_user = useDeleteUser();

  const onDelete = async () => {
    await delete_user.mutateAsync(id);
  };

  return (
    <>
      {delete_user.isPending && <span>deleting user...</span>}

      <button onClick={onDelete}>Delete User</button>

      {delete_user.isSuccess && (
        <span>User deleted successfully ✅, go back home</span>
      )}
      {delete_user.isError && <span>Ups! it was an error 🚨</span>}
    </>
  );
};
