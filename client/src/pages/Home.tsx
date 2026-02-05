import { useContext, useEffect, useState } from "react";

// components
import { Leaderboard, PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { ErrorType, SET_QUEST_DETAILS, SET_VISITOR_INFO } from "@/context/types";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

export const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quest")
        .then((response) => {
          const { questDetails, visitor, badges, visitorInventory } = response.data;
          dispatch!({
            type: SET_QUEST_DETAILS,
            payload: { questDetails, badges },
          });
          dispatch!({
            type: SET_VISITOR_INFO,
            payload: { visitor, visitorInventory },
          });
        })
        .catch((error) => setErrorMessage(dispatch, error as ErrorType))
        .finally(() => setIsLoading(false));
    }
  }, [hasInteractiveParams]);

  return (
    <PageContainer isLoading={isLoading} showAdminIcon={true}>
      <Leaderboard isKeyAsset={true} />
    </PageContainer>
  );
};

export default Home;
