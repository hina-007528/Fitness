import React, { useState } from "react";
import styled from "styled-components";
import { Email, Phone, Place, FitnessCenter, AccessTime } from "@mui/icons-material";
import { submitContact } from "../api";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
  background: ${({ theme }) => theme.bg};
`;

const Wrapper = styled.div`
  flex: 1;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 0px 16px;
  margin-bottom: 32px;
`;

const Title = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
  text-align: center;
  margin-bottom: 16px;
`;

const Subtitle = styled.div`
  font-size: 18px;
  color: ${({ theme }) => theme.text_secondary};
  text-align: center;
  margin-bottom: 32px;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-top: 32px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const ContactInfo = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ContactForm = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  padding: 32px;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 968px) {
    margin-right: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin: 0 0 24px 0;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 24px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.primary + 20};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary};
  flex-shrink: 0;
`;

const ContactDetails = styled.div`
  flex: 1;
`;

const ContactLabel = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin-bottom: 8px;
`;

const ContactValue = styled.div`
  color: ${({ theme }) => theme.text_secondary};
  margin-bottom: 4px;
  
  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${({ theme }) => theme.primary + 20};
      text-decoration: underline;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 5px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.text_primary};
  background: ${({ theme }) => theme.bg};
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 5px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 8px;
  font-size: 16px;
  color: ${({ theme }) => theme.text_primary};
  background: ${({ theme }) => theme.bg};
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary + 20};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.text_primary + 20};
    cursor: not-allowed;
  }
`;

const GymHours = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  padding: 24px;
  margin-top: 20px;
`;

const HoursGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
`;

const DayTime = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.text_primary + 10};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

const SocialButton = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary + 20};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary};
    color: white;
  }
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const response = await submitContact(formData);
      if (response.success) {
        setSubmitStatus('Thank you for your message! We\'ll get back to you within 24 hours.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('Failed to submit form. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Wrapper>
        <Title>Get in Touch</Title>
        <Subtitle>Have questions? We're here to help you achieve your fitness goals</Subtitle>

        <ContactGrid>
          <ContactInfo>
            <SectionTitle>Contact Information</SectionTitle>
            
            <ContactItem>
              <IconWrapper>
                <Email />
              </IconWrapper>
              <ContactDetails>
                <ContactLabel>Email</ContactLabel>
                <ContactValue><a href="mailto:info@fitnesstrack.com">info@fitnesstrack.com</a></ContactValue>
                <ContactValue><a href="mailto:support@fitnesstrack.com">support@fitnesstrack.com</a></ContactValue>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <IconWrapper>
                <Phone />
              </IconWrapper>
              <ContactDetails>
                <ContactLabel>Phone</ContactLabel>
                <ContactValue><a href="tel:+1234567890">+1 (234) 567-890</a></ContactValue>
                <ContactValue><a href="tel:+1234567891">+1 (234) 567-891</a></ContactValue>
              </ContactDetails>
            </ContactItem>

            <ContactItem>
              <IconWrapper>
                <Place />
              </IconWrapper>
              <ContactDetails>
                <ContactLabel>Location</ContactLabel>
                <ContactValue>
                  <a href="https://maps.google.com/?q=123+Fitness+Boulevard+Health+City+HC+12345" target="_blank" rel="noopener noreferrer">
                    123 Fitness Boulevard
                  </a>
                </ContactValue>
                <ContactValue>Health City, HC 12345</ContactValue>
                <ContactValue>United States</ContactValue>
              </ContactDetails>
            </ContactItem>

            <GymHours>
              <SectionTitle style={{ marginBottom: '16px' }}>Gym Hours</SectionTitle>
              <HoursGrid>
                <DayTime>
                  <span>Monday - Friday</span>
                  <span>5:00 AM - 11:00 PM</span>
                </DayTime>
                <DayTime>
                  <span>Saturday</span>
                  <span>6:00 AM - 10:00 PM</span>
                </DayTime>
                <DayTime>
                  <span>Sunday</span>
                  <span>7:00 AM - 9:00 PM</span>
                </DayTime>
                <DayTime>
                  <span>Holidays</span>
                  <span>8:00 AM - 8:00 PM</span>
                </DayTime>
              </HoursGrid>
            </GymHours>

            <SocialLinks>
              <SocialButton href="https://facebook.com/fitnesstrack" target="_blank" rel="noopener noreferrer" title="Facebook">
                <span style={{ fontSize: '20px' }}>f</span>
              </SocialButton>
              <SocialButton href="https://twitter.com/fitnesstrack" target="_blank" rel="noopener noreferrer" title="Twitter">
                <span style={{ fontSize: '20px' }}>𝕏</span>
              </SocialButton>
              <SocialButton href="https://instagram.com/fitnesstrack" target="_blank" rel="noopener noreferrer" title="Instagram">
                <span style={{ fontSize: '20px' }}>📷</span>
              </SocialButton>
              <SocialButton href="https://youtube.com/fitnesstrack" target="_blank" rel="noopener noreferrer" title="YouTube">
                <span style={{ fontSize: '20px' }}>▶</span>
              </SocialButton>
              <SocialButton href="https://linkedin.com/company/fitnesstrack" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <span style={{ fontSize: '20px' }}>in</span>
              </SocialButton>
            </SocialLinks>
          </ContactInfo>

          <ContactForm>
            <SectionTitle>Send us a Message</SectionTitle>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help you?"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="message">Message *</Label>
                <TextArea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more about your fitness goals or questions..."
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </SubmitButton>

              {submitStatus && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  {submitStatus}
                </div>
              )}
            </form>
          </ContactForm>
        </ContactGrid>
      </Wrapper>
    </Container>
  );
};

export default Contact;
