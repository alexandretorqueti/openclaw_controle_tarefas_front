const React = require('react');




import {
  FaRobot,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLink,
  FaUnlink,
  FaSync,
  FaCheck,
  FaTimes,
  FaUserCircle,
  FaSpinner,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";


const styles = {
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  "@keyframes slideIn": {
    "0%": { transform: "translateX(100%)", opacity: 0 },
    "100%": { transform: "translateX(0)", opacity: 1 },
  },
};

const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  
  const [searchName, setSearchName] = useState("");
  const [searchModel, setSearchModel] = useState("");

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showBindingsModal, setShowBindingsModal] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState<string>("");
  const [newAgentWorkspace, setNewAgentWorkspace] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [editAgentName, setEditAgentName] = useState<string>("");
  const [editAgentEmoji, setEditAgentEmoji] = useState<string>("");
  const [editAgentAvatar, setEditAgentAvatar] = useState<string>("");
  const [editAgentModel, setEditAgentModel] = useState<string>("");
  const [editAgentWorkspace, setEditAgentWorkspace] = useState<string>("");
  const [editAgentVibe, setEditAgentVibe] = useState<string>("");
  const [editAgentSoul, setEditAgentSoul] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [newBinding, setNewBinding] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);

  
  const [processingToast, setProcessingToast] = useState<{
    visible: boolean;
    message: string;
    type: "processing" | "success" | "error";
    steps?: string[];
    currentStep?: number;
  }>({
    visible: false,
    message: "",
    type: "processing",
  });

  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = (await api.getAgents()) as AgentsResponse;
      if (response.success) {
        setAgents(response.data);
      } else {
        
        setProcessingToast({
          visible: true,
          message: `Erro ao carregar agentes: ${response.error || "Erro desconhecido"}`,
          type: "error",
        });
      }
    } catch (err: any) {
      
      setProcessingToast({
        visible: true,
        message: `Erro ao conectar com o servidor: ${err.message || "Erro desconhecido"}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();

