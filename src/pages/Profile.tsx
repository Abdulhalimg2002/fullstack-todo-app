import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { loginSchemaU } from "../validation";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "../config/axios.config";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import { SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { IupdateInput } from "../data";
import InputErrorMessage from "../components/ui/InputErrorMessage";

interface Iuser {
  username: string;
  email: string;
  id?: number;
}

const Profile = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<Iuser>({
    resolver: yupResolver(loginSchemaU),
  });

useCustomQuery({
  queryKey: ["UserU"],
  url: "users/me?populate=todos",
  config: {
    headers: {
      Authorization: `Bearer ${userData.jwt}`,
    },
  },
});

  const onCloseEditModal = () => {
    reset();
    setIsEditModalOpen(false);
  };

  const onOpenEditModal = (user: Iuser) => {
    reset({
      username: user.username,
      email: user.email,
    });
    setIsEditModalOpen(true);
  };

  const SubmitUpdateUHandler: SubmitHandler<Iuser> = async (data) => {
    setIsUpdating(true);
    try {
      const { status } = await axiosInstance.put(
        `/users/${userData.user.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`,
          },
        }
      );

      if (status === 200) {
        // تحديث بيانات المستخدم في localStorage
        const updatedUser = {
          ...userData,
          user: { ...userData.user, ...data },
        };
        localStorage.setItem(storageKey, JSON.stringify(updatedUser));

        toast.success("User updated successfully!", {
          position: "bottom-center",
        });
        onCloseEditModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!", { position: "bottom-center" });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderupdate = IupdateInput.map(
    ({ name, placeholder, type, validation }, idx) => {
      return (
        <div key={idx}>
          <Input
            type={type}
            placeholder={placeholder}
            {...register(name, validation)}
          />
          {errors[name] && (
            <InputErrorMessage msg={errors[name]?.message} />
          )}
        </div>
      );
    }
  );

  if (!userData) {
    return <p className="text-center mt-10">No user data found.</p>;
  }

  return (
    <>
    <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 ">
  <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-md sm:max-w-lg md:max-w-xl transition-all">
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
      User Profile
    </h2>

    <div className="space-y-4">
      <div>
        <p className="text-gray-500 font-semibold text-sm sm:text-base">Username</p>
        <p className="text-gray-800 text-base sm:text-lg break-words">{userData.user.username}</p>
      </div>

      <div>
        <p className="text-gray-500 font-semibold text-sm sm:text-base">Email</p>
        <p className="text-gray-800 text-base sm:text-lg break-words">{userData.user.email}</p>
      </div>
    </div>

    <div className="mt-8 flex justify-center">
      <Button
        onClick={() => onOpenEditModal(userData.user)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base px-5 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300"
      >
        Edit Profile
      </Button>
    </div>
  </div>
</div>



      <Modal
        isOpen={isEditModalOpen}
        closeModal={onCloseEditModal}
        title="Edit Profile"
      >
        <form className="space-y-3" onSubmit={handleSubmit(SubmitUpdateUHandler)}>
          {renderupdate}

          <div className="flex items-center space-x-3 mt-4">
            <Button
              className="bg-indigo-700 hover:bg-indigo-800 shadow-md"
              isLoading={isUpdating}
            >
              Update
            </Button>
            <Button variant="cancel" type="button" onClick={onCloseEditModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Profile;
