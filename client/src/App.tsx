import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Influencers from "./pages/Influencers";
import InfluencerDetail from "./pages/InfluencerDetail";
import Sales from "./pages/Sales";
import Ads from "./pages/Ads";
import Automation from "./pages/Automation";
import Dashboard from "./pages/Dashboard";
import Samples from "./pages/Samples";
import SampleDetail from "./pages/SampleDetail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/:id"} component={ProjectDetail} />
      <Route path={"/influencers"} component={Influencers} />
      <Route path={"/influencers/:id"} component={InfluencerDetail} />
      <Route path={"/sales"} component={Sales} />
      <Route path={"/ads"} component={Ads} />
      <Route path={"/automation"} component={Automation} />
      <Route path={"/samples"} component={Samples} />
      <Route path={"/samples/:id"} component={SampleDetail} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
