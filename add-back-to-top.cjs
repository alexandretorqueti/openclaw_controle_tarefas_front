const fs = require('fs');
const path = require('path');

// Import React and FaArrowUp icon for both files
const reactImport = "import React, { useState } from 'react';\n";
const faArrowUpImport = "import { FaArrowUp } from 'react-icons/fa';\n";

// Function to add back-to-top button to TaskList
const taskListPath = path.join(__dirname, 'src/components/TaskList.tsx');
let taskListContent = fs.readFileSync(taskListPath, 'utf8');

// Add FaArrowUp import if not already present
if (!taskListContent.includes("FaArrowUp")) {
  // Find the import line for react-icons/fa
  const faImportMatch = taskListContent.match(/import {[^}]*} from 'react-icons\/fa'/);
  if (faImportMatch) {
    // Add FaArrowUp to the existing import
    const oldImport = faImportMatch[0];
    const newImport = oldImport.replace('}', ', FaArrowUp}');
    taskListContent = taskListContent.replace(oldImport, newImport);
  } else {
    // Add new import line after React import
    const reactImportMatch = taskListContent.match(/import React[^;]*;/);
    if (reactImportMatch) {
      taskListContent = taskListContent.replace(reactImportMatch[0], reactImportMatch[0] + '\n' + faArrowUpImport);
    }
  }
}

// Add scroll state and function
const scrollState = `
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

// Add scroll state after other states
const useStateMatch = taskListContent.match(/const \[[^\]]*\], set[^\]]*\] = useState\([^;]*\);/g);
if (useStateMatch) {
  const lastUseState = useStateMatch[useStateMatch.length - 1];
  const insertIndex = taskListContent.indexOf(lastUseState) + lastUseState.length;
  taskListContent = taskListContent.slice(0, insertIndex) + scrollState + taskListContent.slice(insertIndex);
}

// Add back-to-top button at the end of the component (before the closing div)
const taskListClosing = 'export default TaskList;';
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
    </div>
  );
`;

// Replace the closing div with the button
taskListContent = taskListContent.replace(/\s*<\/div>\s*\);\s*};/s, backToTopButton + '\n\nexport default TaskList;');

fs.writeFileSync(taskListPath, taskListContent, 'utf8');
console.log('✅ Botão "Retornar ao Topo" adicionado à TaskList!');

// Function to add back-to-top button to TaskDetail
const taskDetailPath = path.join(__dirname, 'src/components/TaskDetail.tsx');
let taskDetailContent = fs.readFileSync(taskDetailPath, 'utf8');

// Add FaArrowUp import if not already present
if (!taskDetailContent.includes("FaArrowUp")) {
  // Find the import line for react-icons/fa
  const faImportMatch = taskDetailContent.match(/import {[^}]*} from 'react-icons\/fa'/);
  if (faImportMatch) {
    // Add FaArrowUp to the existing import
    const oldImport = faImportMatch[0];
    const newImport = oldImport.replace('}', ', FaArrowUp}');
    taskDetailContent = taskDetailContent.replace(oldImport, newImport);
  } else {
    // Add new import line after React import
    const reactImportMatch = taskDetailContent.match(/import React[^;]*;/);
    if (reactImportMatch) {
      taskDetailContent = taskDetailContent.replace(reactImportMatch[0], reactImportMatch[0] + '\n' + faArrowUpImport);
    }
  }
}

// Add scroll state and function to TaskDetail
const taskDetailUseStateMatch = taskDetailContent.match(/const \[[^\]]*\], set[^\]]*\] = useState\([^;]*\);/g);
if (taskDetailUseStateMatch) {
  const lastUseState = taskDetailUseStateMatch[taskDetailUseStateMatch.length - 1];
  const insertIndex = taskDetailContent.indexOf(lastUseState) + lastUseState.length;
  taskDetailContent = taskDetailContent.slice(0, insertIndex) + scrollState + taskDetailContent.slice(insertIndex);
}

// Add back-to-top button at the end of TaskDetail component
const taskDetailClosing = 'export default TaskDetail;';
const taskDetailBackToTopButton = `
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
    </div>
  );
`;

// Replace the closing div with the button
taskDetailContent = taskDetailContent.replace(/\s*<\/div>\s*\);\s*};/s, taskDetailBackToTopButton + '\n\nexport default TaskDetail;');

fs.writeFileSync(taskDetailPath, taskDetailContent, 'utf8');
console.log('✅ Botão "Retornar ao Topo" adicionado à TaskDetail!');
