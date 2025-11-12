import Button from "./ui/Button";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import {  useState } from "react";
import { ITodo } from "../interfaces";
import axiosInstance from "../config/axios.config";
import TodoSkeleton from "./TodoSkeleton";
import { faker } from "@faker-js/faker";
import toast from "react-hot-toast";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AddtodoV, EditTv } from "../validation";
import InputErrorMessage from "./ui/InputErrorMessage";

interface ITODO {
  title: string;
  description: string;
}

const TodoList = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [queryVersion, setQueryVersion] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<ITodo>({
    id: 0,
    title: "",
    description: "",
    validation: {
      required: false,
      minLength: 0,
    },
  });
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);

  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const { isLoading, data } = useCustomQuery({
    queryKey: ["todoList", `${queryVersion}`],
    url: "users/me?populate=todos",
    config: {
      headers: {
        Authorization: `Bearer ${userData.jwt}`,
      },
    },
  });

  // ---------- Add Todo Form ----------
  const {
    handleSubmit: handleAddSubmit,
    register: registerAdd,
    formState: { errors: addErrors },
    reset: resetAddForm,
  } = useForm<ITODO>({
    resolver: yupResolver(AddtodoV),
  });

  // ---------- Edit Todo Form ----------
  const {
    handleSubmit: handleEditSubmit,
    register: registerEdit,
    formState: { errors: editErrors },
    reset: resetEditForm,
  } = useForm<ITODO>({
    resolver: yupResolver(EditTv),
  });

  // ---------- Modal Handlers ----------
  const onCloseEditModal = () => {
    resetEditForm();
    setIsEditModalOpen(false);
  };

  const onOpenEditModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    resetEditForm({
      title: todo.title,
      description: todo.description,
    });
    setIsEditModalOpen(true);
  };

  const onCloseAddModal = () => {
    resetAddForm();
    setIsOpenAddModal(false);
  };

  const onOpenAddModal = () => {
    setIsOpenAddModal(true);
  };

  const closeConfirmModal = () => {
    setTodoToEdit({
      id: 0,
      title: "",
      description: "",
      validation: { required: false, minLength: 0 },
    });
    setIsOpenConfirmModal(false);
  };

  const openConfirmModal = (todo: ITodo) => {
    setTodoToEdit(todo);
    setIsOpenConfirmModal(true);
  };

  const onGenerateTodos = async () => {
    for (let i = 0; i < 100; i++) {
      try {
        await axiosInstance.post(
          `/todos`,
          {
            data: {
              title: faker.word.words(5),
              description: faker.lorem.paragraph(2),
              user: [userData.user.id],
            },
          },
          { headers: { Authorization: `Bearer ${userData.jwt}` } }
        );
      } catch (error) {
        console.log(error);
      }
    }
    setQueryVersion((prev) => prev + 1);
  };

  const onRemove = async () => {
    try {
      const { status } = await axiosInstance.delete(`/todos/${todoToEdit.documentId}`, {
        headers: { Authorization: `Bearer ${userData.jwt}` },
      });
      if (status === 200 || status === 204) {
        toast.error("The todo is deleted", {
          position: "bottom-center",
          duration: 1500,
          style: { backgroundColor: "red", color: "white", width: "fit-content" },
        });
        closeConfirmModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---------- Add Todo Submit ----------
  const onSubmitAddTodoHandler: SubmitHandler<ITODO> = async (data) => {
    setIsUpdating(true);
    try {
      const { status } = await axiosInstance.post(
        `/todos`,
        { data: { ...data, user: [userData.user.id] } },
        { headers: { Authorization: `Bearer ${userData.jwt}` } }
      );
      if (status === 200) {
        onCloseAddModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------- Update Todo Submit ----------
  const onSubmitUpdateHandler: SubmitHandler<ITODO> = async (data) => {
    setIsUpdating(true);
    try {
      const { status } = await axiosInstance.put(
        `/todos/${todoToEdit.documentId}`,
        { data },
        { headers: { Authorization: `Bearer ${userData.jwt}` } }
      );
      if (status === 200) {
        toast.success("Todo updated successfully!", { position: "bottom-center" });
        onCloseEditModal();
        setQueryVersion((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return (
      <div className="space-y-1 p-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <TodoSkeleton key={idx} />
        ))}
      </div>
    );

  return (
    <div className="space-y-1">
      <div className="flex w-fit mx-auto my-10 gap-x-2">
        <Button variant="default" onClick={onOpenAddModal} size="sm">
          Post new todo
        </Button>
        <Button variant="outline" onClick={onGenerateTodos} size="sm">
          Generate todos
        </Button>
      </div>

      {data?.todos?.length ? (
        data.todos.map((todo: ITodo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100"
          >
            <p className="w-full font-semibold">
              {todo.id} - {todo.title}
            </p>
            <div className="flex items-center justify-end w-full space-x-3">
              <Button variant="default" size="sm" onClick={() => onOpenEditModal(todo)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => openConfirmModal(todo)}>
                Remove
              </Button>
            </div>
          </div>
        ))
      ) : (
        <h3>No Todos Yet</h3>
      )}

      {/* Add Modal */}
      <Modal isOpen={isOpenAddModal} closeModal={onCloseAddModal} title="Add a new todo">
        <form className="space-y-3" onSubmit={handleAddSubmit(onSubmitAddTodoHandler)}>
          <Input placeholder="Enter todo title" {...registerAdd("title")} />
          {addErrors.title && <InputErrorMessage msg={addErrors.title.message} />}
          <Textarea placeholder="Enter todo description" {...registerAdd("description")} />
          {addErrors.description && <InputErrorMessage msg={addErrors.description.message} />}
          <div className="flex items-center space-x-3 mt-4">
            <Button className="bg-indigo-700 hover:bg-indigo-800" isLoading={isUpdating}>
              Done
            </Button>
            <Button type="button" variant="cancel" onClick={onCloseAddModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} closeModal={onCloseEditModal} title="Edit this todo">
        <form className="space-y-3" onSubmit={handleEditSubmit(onSubmitUpdateHandler)}>
          <Input placeholder="Update todo title" {...registerEdit("title")} />
          {editErrors.title && <InputErrorMessage msg={editErrors.title.message} />}
          <Textarea placeholder="Update todo description" {...registerEdit("description")} />
          {editErrors.description && <InputErrorMessage msg={editErrors.description.message} />}
          <div className="flex items-center space-x-3 mt-4">
            <Button className="bg-indigo-700 hover:bg-indigo-800" isLoading={isUpdating}>
              Update
            </Button>
            <Button variant="cancel" type="button" onClick={onCloseEditModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isOpenConfirmModal}
        closeModal={closeConfirmModal}
        title="Are you sure you want to remove this todo from your store ?"
        description="Deleting this todo will remove it permanently from your inventory. Any associated data, sales history, and other related information will also be deleted. Please make sure this is the intended action."
      >
        <div className="flex items-center space-x-3 mt-4">
          <Button variant="danger" onClick={onRemove}>
            Yes, Remove
          </Button>
          <Button variant="cancel" type="button" onClick={closeConfirmModal}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TodoList;
