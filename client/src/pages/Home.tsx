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
          const { questDetails, visitor } = response.data;
          dispatch!({
            type: SET_QUEST_DETAILS,
            payload: { questDetails },
          });
          dispatch!({
            type: SET_VISITOR_INFO,
            payload: { visitor },
          });
        })
        .catch((error) => setErrorMessage(dispatch, error as ErrorType))
        .finally(() => setIsLoading(false));
    }
  }, [hasInteractiveParams]);

  return (
    <PageContainer isLoading={isLoading}>
      <Leaderboard isKeyAsset={true} />
    </PageContainer>
  );
};

export default Home;
