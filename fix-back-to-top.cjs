const fs = require('fs');
const path = require('path');

// Function to properly add back-to-top button to TaskList
const taskListPath = path.join(__dirname, 'src/components/TaskList.tsx');
let taskListContent = fs.readFileSync(taskListPath, 'utf8');

// First, let's check if the imports are correct
if (!taskListContent.includes("FaArrowUp")) {
  // Add FaArrowUp to the existing import
  const faImportMatch = taskListContent.match(/import {[^}]*} from 'react-icons\/fa'/);
  if (faImportMatch) {
    const oldImport = faImportMatch[0];
    const newImport = oldImport.replace('}', ', FaArrowUp}');
    taskListContent = taskListContent.replace(oldImport, newImport);
  }
}

// Check if useState is imported from React
if (!taskListContent.includes("useState")) {
  const reactImportMatch = taskListContent.match(/import React[^;]*;/);
  if (reactImportMatch) {
    const oldImport = reactImportMatch[0];
    const newImport = oldImport.replace('import React', 'import React, { useState }');
    taskListContent = taskListContent.replace(oldImport, newImport);
  }
}

// Add the back-to-top state and functions after other states
const scrollCode = `
  // Back to top functionality
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll to show/hide back to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
`;

// Find a good place to insert the scroll code - after the last useState
const useStateRegex = /const \[[^\]]*\], set[^\]]*\] = useState\([^;]*\);/g;
const useStateMatches = taskListContent.match(useStateRegex);
if (useStateMatches) {
  const lastUseState = useStateMatches[useStateMatches.length - 1];
  const insertIndex = taskListContent.indexOf(lastUseState) + lastUseState.length;
  taskListContent = taskListContent.slice(0, insertIndex) + scrollCode + taskListContent.slice(insertIndex);
} else {
  // If no useState found, add after the component function declaration
  const componentStart = taskListContent.indexOf('const TaskList: React.FC<TaskListProps> = ({');
  if (componentStart !== -1) {
    const firstBrace = taskListContent.indexOf('{', componentStart);
    const insertIndex = firstBrace + 1;
    taskListContent = taskListContent.slice(0, insertIndex) + scrollCode + taskListContent.slice(insertIndex);
  }
}

// Now replace the comment with the actual button
const backToTopButton = `
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#4ECDC4',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            zIndex: 1000,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3db8af';
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4ECDC4';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          <FaArrowUp />
        </button>
      )}
`;

// Replace the comment with the button
taskListContent = taskListContent.replace(
  /\/\* Back to Top Button \*\/\s*\n\s*<\/div>/,
  backToTopButton + '\n    </div>'
);

fs.writeFileSync(taskListPath, taskListContent, 'utf8');
console.log('✅ Botão "Retornar ao Topo" implementado corretamente na TaskList!');

// Function to properly add back-to-top button to TaskDetail
const taskDetailPath = path.join(__dirname, 'src/components/TaskDetail.tsx');
let taskDetailContent = fs.readFileSync(taskDetailPath, 'utf8');

// First, let's check if the imports are correct
if (!taskDetailContent.includes("FaArrowUp")) {
  // Add FaArrowUp to the existing import
  const faImportMatch = taskDetailContent.match(/import {[^}]*} from 'react-icons\/fa'/);
  if (faImportMatch) {
    const oldImport = faImportMatch[0];
    const newImport = oldImport.replace('}', ', FaArrowUp}');
    taskDetailContent = taskDetailContent.replace(oldImport, newImport);
  }
}

// Check if useState is imported from React
if (!taskDetailContent.includes("useState")) {
  const reactImportMatch = taskDetailContent.match(/import React[^;]*;/);
  if (reactImportMatch) {
    const oldImport = reactImportMatch[0];
    const newImport = oldImport.replace('import React', 'import React, { useState }');
    taskDetailContent = taskDetailContent.replace(oldImport, newImport);
  }
}

// Add the back-to-top state and functions after other states in TaskDetail
const taskDetailUseStateRegex = /const \[[^\]]*\], set[^\]]*\] = useState\([^;]*\);/g;
const taskDetailUseStateMatches = taskDetailContent.match(taskDetailUseStateRegex);
if (taskDetailUseStateMatches) {
  const lastUseState = taskDetailUseStateMatches[taskDetailUseStateMatches.length - 1];
  const insertIndex = taskDetailContent.indexOf(lastUseState) + lastUseState.length;
  taskDetailContent = taskDetailContent.slice(0, insertIndex) + scrollCode + taskDetailContent.slice(insertIndex);
} else {
  // If no useState found, add after the component function declaration
  const componentStart = taskDetailContent.indexOf('const TaskDetail: React.FC<TaskDetailProps> = ({');
  if (componentStart !== -1) {
    const firstBrace = taskDetailContent.indexOf('{', componentStart);
    const insertIndex = firstBrace + 1;
    taskDetailContent = taskDetailContent.slice(0, insertIndex) + scrollCode + taskDetailContent.slice(insertIndex);
  }
}

// Now replace the comment with the actual button in TaskDetail
taskDetailContent = taskDetailContent.replace(
  /\/\* Back to Top Button \*\/\s*\n\s*<\/div>/,
  backToTopButton + '\n    </div>'
);

fs.writeFileSync(taskDetailPath, taskDetailContent, 'utf8');
console.log('✅ Botão "Retornar ao Topo" implementado corretamente na TaskDetail!');
