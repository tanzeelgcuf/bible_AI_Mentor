from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from io import BytesIO
import base64
from datetime import datetime
from typing import List, Dict

class PDFExportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        # Custom styles for Spanish content
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=colors.darkblue,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='ConversationUser',
            parent=self.styles['Normal'],
            fontSize=12,
            leftIndent=20,
            spaceBefore=10,
            textColor=colors.darkgreen
        ))
        
        self.styles.add(ParagraphStyle(
            name='ConversationAI',
            parent=self.styles['Normal'],
            fontSize=12,
            leftIndent=40,
            spaceBefore=10,
            spaceAfter=10,
            textColor=colors.darkblue
        ))
    
    async def export_conversation(self, conversation: Dict, user_name: str) -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        story = []
        
        # Header with logo and title
        story.append(Paragraph("Un Millón de Predicadores", self.styles['CustomTitle']))
        story.append(Spacer(1, 20))
        
        # Conversation details
        assistant_names = {
            'bible_mentor': 'Mentor Bíblico',
            'sermon_coach': 'Entrenador de Sermones',
            'exegesis_guide': 'Guía de Exégesis'
        }
        
        assistant_name = assistant_names.get(conversation['assistant_type'], 'Asistente IA')
        
        story.append(Paragraph(f"<b>Conversación con:</b> {assistant_name}", self.styles['Normal']))
        story.append(Paragraph(f"<b>Usuario:</b> {user_name}", self.styles['Normal']))
        story.append(Paragraph(f"<b>Fecha:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}", self.styles['Normal']))
        story.append(Spacer(1, 30))
        
        # Messages
        for message in conversation.get('messages', []):
            if message['role'] == 'user':
                story.append(Paragraph(f"<b>Pregunta:</b> {message['content']}", self.styles['ConversationUser']))
            else:
                story.append(Paragraph(f"<b>Respuesta del {assistant_name}:</b>", self.styles['Normal']))
                story.append(Paragraph(message['content'], self.styles['ConversationAI']))
                story.append(Spacer(1, 10))
        
        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph("—" * 50, self.styles['Normal']))
        story.append(Paragraph(
            "Este documento fue generado por la plataforma Un Millón de Predicadores<br/>"
            "Una iniciativa para capacitar predicadores hispanos con tecnología de IA<br/>"
            "www.unmillondepredicadores.org",
            self.styles['Normal']
        ))
        
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    async def export_workshop_completion(self, workshop: Dict, user_name: str) -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        story = []
        
        # Certificate header
        story.append(Paragraph("CERTIFICADO DE COMPLETACIÓN", self.styles['CustomTitle']))
        story.append(Spacer(1, 40))
        
        # Certificate content
        story.append(Paragraph(
            f"Certificamos que <b>{user_name}</b> ha completado exitosamente el taller:",
            self.styles['Normal']
        ))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph(f"<b>{workshop['title']}</b>", self.styles['Heading2']))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph(
            f"Duración: {workshop['duration_minutes']} minutos<br/>"
            f"Fecha de completación: {datetime.now().strftime('%d de %B de %Y')}",
            self.styles['Normal']
        ))
        
        story.append(Spacer(1, 60))
        story.append(Paragraph("Un Millón de Predicadores", self.styles['Heading3']))
        story.append(Paragraph("Plataforma Educativa para Predicadores Hispanos", self.styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer