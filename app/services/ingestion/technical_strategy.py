import logging
import pandas as pd
import io
from typing import List, Dict, Any
from .strategies import IngestionStrategy

logger = logging.getLogger(__name__)

class TechnicalStandardStrategy(IngestionStrategy):
    """
    Strategy for Technical Standards (ISO, NIST) usually provided in Spreadsheets.
    Each row becomes a chunk.
    """

    def ingest(self, source: str, **kwargs) -> List[Dict[str, Any]]:
        """
        Ingests Excel/CSV.
        Source: binary content path or URL (if we add download logic later).
        Here assuming 'source' is a file path.
        """
        chunks = []
        base_metadata = kwargs.get('metadata', {})
        
        try:
            if source.endswith('.xlsx') or source.endswith('.xls'):
                df = pd.read_excel(source)
            elif source.endswith('.csv'):
                df = pd.read_csv(source)
            else:
                raise ValueError("Unsupported file format. Use .xlsx or .csv")
            
            # Normalize columns to lower case for consistency
            df.columns = df.columns.str.lower()
            
            # Iterate Key-Value pairs
            for _, row in df.iterrows():
                # Construct content string explicitly from key columns
                # Heuristic: Look for 'control', 'description', 'requirement'
                
                content_parts = []
                row_meta = base_metadata.copy()
                
                # Dynamic mapping
                if 'control_id' in row:
                    content_parts.append(f"Control ID: {row['control_id']}")
                    row_meta['control_id'] = str(row['control_id'])
                
                if 'description' in row:
                    content_parts.append(f"Description: {row['description']}")
                elif 'requirement' in row:
                    content_parts.append(f"Requirement: {row['requirement']}")
                    
                # Add other columns to metadata, excluding the heavy content ones
                for col in df.columns:
                    if col not in ['description', 'requirement', 'control_id']:
                         # Add to content if likely relevant text, else metadata
                         val = str(row[col])
                         if len(val) > 50:
                             content_parts.append(f"{col.title()}: {val}")
                         else:
                             row_meta[col] = val

                final_content = "\n".join(content_parts)
                
                if final_content.strip():
                    chunks.append({
                        "content": final_content,
                        "metadata": row_meta
                    })
                    
        except Exception as e:
            logger.error(f"Error reading spreadsheet: {e}")
            raise

        return chunks
