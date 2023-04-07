import { CardForm } from "./components/CardForm";
import { Wrapper } from "./components/Wrapper";

function App() {
  return (
    <div className="bg-gray-50">
      <div className="overflow-hidden w-full h-screen hidden sm:block">
        <div className="fixed w-full top-1/2 left-1/2 transform -rotate-6 scale-150 -translate-y-1/2 -translate-x-1/2">
          <div className="h-12 w-64 bg-purple-500 mix-blend-darken transform -skew-x-6 -translate-y-1/2 translate-x-full float-left rounded-lg"></div>{" "}
          <div className="h-12 bg-blue-400"></div>{" "}
          <div className="h-12 w-64 bg-purple-500 mix-blend-darken transform -skew-x-6 -translate-y-1/2 -translate-x-full float-right rounded-lg"></div>
        </div>
      </div>
      <div className="w-full min-h-screen flex items-center flex-col absolute top-0 left-0">
        <Wrapper
          amount={1337.65}
          billId="#150"
          description="Жвачка и чипсы"
          remaining={60_000}
        >
          <CardForm onSubmit={console.log} />
        </Wrapper>
      </div>
    </div>
  );
}

export default App;
