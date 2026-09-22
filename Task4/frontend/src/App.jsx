import {Navigate,Route,Routes} from "react-router-dom";import {useAuth} from "./auth.jsx";import AuthPage from "./pages/AuthPage.jsx";import Workspace from "./pages/Workspace.jsx";
function P({children}){const{user,loading}=useAuth();if(loading)return <div className="full-loader">Loading DevFlow…</div>;return user?children:<Navigate to="/login" replace/>}
function G({children}){const{user,loading}=useAuth();if(loading)return <div className="full-loader">Loading DevFlow…</div>;return user?<Navigate to="/" replace/>:children}
export default function App(){return <Routes><Route path="/login" element={<G><AuthPage mode="login"/></G>}/><Route path="/register" element={<G><AuthPage mode="register"/></G>}/><Route path="/*" element={<P><Workspace/></P>}/></Routes>}
