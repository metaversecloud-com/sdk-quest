import { useContext, useState } from "react";
import { useForm } from "react-hook-form";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalStateContext } from "@context/GlobalContext";
import { GlobalDispatchContext } from "@context/GlobalContext";
import { SET_QUEST_DETAILS } from "@/context/types";

export const AdminForm = ({ setErrorMessage }: { setErrorMessage: (value: string) => void }) => {
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // context
  const { questDetails } = useContext(GlobalStateContext);
  const { numberAllowedToCollect, questItemImage } = questDetails
  const dispatch = useContext(GlobalDispatchContext);

  const {
    handleSubmit,
    register,
  } = useForm();

  const onSubmit = handleSubmit((data) => {
    const { numberAllowedToCollect, questItemImage } = data
    setAreButtonsDisabled(true);
    setErrorMessage("");
    backendAPI.post("/admin-settings", { numberAllowedToCollect, questItemImage })
      .then(() => {
        dispatch!({
          type: SET_QUEST_DETAILS,
          payload: { ...questDetails, numberAllowedToCollect, questItemImage },
        });
      })
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => setAreButtonsDisabled(false))
  });

  const removeQuest = () => {
    setErrorMessage("");
    setAreButtonsDisabled(true);
    setIsLoading(true);
    backendAPI.delete("/quest")
      .catch((error) => setErrorMessage(error?.response?.data?.message || error.message))
      .finally(() => {
        setAreButtonsDisabled(false);
        setIsLoading(false);
        setShowModal(false);
      })
  };

  return (
    <div className="container grid gap-2">
      <hr />
      <form onSubmit={onSubmit}>
        <div className="mt-4">
          <label htmlFor="numberAllowedToCollect">Number Allowed To Collect Per Day:</label>
          <input
            className="input"
            {...register("numberAllowedToCollect", { required: true, value: numberAllowedToCollect })}
          />
        </div>

        <div>
          <label htmlFor="questItemImage">Quest Item Image URL:</label>
          <input
            className="input"
            {...register("questItemImage", { required: true, value: questItemImage })}
          />
          <p className="p3">Update image for all Quest Items in world. This will not change the Key Asset image.</p>
        </div>

        <button className="btn my-2" disabled={areButtonsDisabled} type="submit">
          Save
        </button>
        <button className="btn btn-danger" disabled={areButtonsDisabled} onClick={() => setShowModal(true)}>
          Remove Quest from world
        </button>
      </form>
      <hr className="mt-4 mb-2" />

      {showModal && (
        <div className="modal-container">
          <div className="modal">
            <h4 className="h4">Remove Quest from World</h4>
            <p className="p2">
              This will remove this Quest and all associated data permanently. Are you sure you'd like to continue?
            </p>
            <div className="actions">
              <button disabled={isLoading} className="btn btn-outline" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button disabled={isLoading} className="btn btn-danger" onClick={removeQuest}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
