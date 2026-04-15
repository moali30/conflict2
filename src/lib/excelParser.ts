import * as XLSX from 'xlsx';

export interface Conflict {
  id: string;
  course1: string;
  course2: string;
  conflictCount: number;
}

export function parseExcel(file: File): Promise<{ conflicts: Conflict[], courses: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (json.length < 2) {
          throw new Error("File is empty or invalid format.");
        }

        const headers = json[0];
        const conflicts: Conflict[] = [];
        const coursesSet = new Set<string>();
        
        for (let i = 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0) continue;
          
          const rowCourse = String(row[0]).trim();
          if (!rowCourse) continue;
          coursesSet.add(rowCourse);

          for (let j = 1; j < headers.length; j++) {
            const colCourse = String(headers[j]).trim();
            if (!colCourse) continue;
            coursesSet.add(colCourse);
            
            if (rowCourse === colCourse) continue;

            const cellValue = row[j];
            const conflictCount = parseInt(cellValue, 10);

            if (!isNaN(conflictCount) && conflictCount > 0) {
              const [c1, c2] = [rowCourse, colCourse].sort();
              
              const existing = conflicts.find(c => c.course1 === c1 && c.course2 === c2);
              if (existing) {
                 existing.conflictCount = Math.max(existing.conflictCount, conflictCount);
              } else {
                conflicts.push({
                  id: `${c1}---${c2}`,
                  course1: c1,
                  course2: c2,
                  conflictCount
                });
              }
            }
          }
        }
        
        resolve({ conflicts, courses: Array.from(coursesSet).sort() });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
